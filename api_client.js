import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

function _getApiBaseUrl(env) {
    if (env == 'local') {
        return 'http://Emils-MacBook-Pro.local:3010/v2';
    }
    if (env == 'dev') {
        return 'https://api.rezidy.emilhus.com/v2';
    }
    return 'https://api.rezidy.com/v2';
}
const API_BASE_URL = _getApiBaseUrl('dev');

function _getApiKey(platform) {
    if (platform == 'ios') {
        return '759d80a46bc3909721690e2b51690fd9';
    }
    if (platform == 'android') {
        return '1e052173bf35ae177131ae59b7fa98bd';
    }
    if (platform == 'windows') {
        return 'b43386d81088d05f341c112c67017bd2';
    }
    if (platform == 'macos') {
        return 'd3974ba2f9d66e9ee6d62689388873ca';
    }
    if (platform == 'web') {
        return '8ece2254ad413998fe2e5fa23255b158';
    }
    return null;
}
const API_KEY = _getApiKey(Platform.OS);

let accessToken = null;
let refreshToken = null;

function _encodePair(pair) {
    const [k, v] = pair;
    if (Array.isArray(v)) {
        return v.map(vv => encodeURIComponent(k) + '[]=' + encodeURIComponent(vv)).join('&')
    }
    return encodeURIComponent(k) + '=' + encodeURIComponent(v);
}

async function _withRetry(fn) {
    let res = await fn();
    if (accessToken != null && res.status == 401) {
        const refreshSuccessful = await _refreshToken();
        if (refreshSuccessful) {
            res = await fn();
        }
    }
    return res;
}

async function _fetch(url, options) {
    options.headers['authorization'] = `Bearer ${API_KEY}`;
    const token = await _loadToken();
    if (token != null) {
        options.headers['x-rezidy-auth-token'] = token;
    }

    const logLines = [];

    logLines.push(`==========HTTP Dump`);
    logLines.push(`Request Method: ${options.method}`);
    logLines.push(`Request URL: ${url}`);
    logLines.push(`Request Headers: ${JSON.stringify(options.headers, null, 4)}`);
    if (options.body) {
        const logBody = { ...options.body };
        if (logBody.password) {
            logBody.password = ''.padEnd(logBody.password.length, '*');
        }

        if (options.body instanceof FormData) {
            logLines.push('Request Body: *FormData*');
        } else {
            logLines.push(`Request Body: ${JSON.stringify(logBody, null, 4)}`);
            options.body = JSON.stringify(options.body);
        }
    }
    const res = await fetch(url, options);
    const ret = {
        is2xx: res.status>=200 && res.status<=299,
        is3xx: res.status>=300 && res.status<=399,
        is4xx: res.status>=400 && res.status<=499,
        is5xx: res.status>=500 && res.status<=599,
        url: res.url,
        status: res.status,
        headers: res.headers.map,
        body: await res.text(),
    };

    logLines.push(`Response Status: ${ret.status}`);
    //logLines.push(`Response Headers: ${JSON.stringify(ret.headers, null, 4)}`);

    try {
        if (ret.body !== '') {
            ret.body = JSON.parse(ret.body);
        }

        if (ret.is2xx && Array.isArray(ret.body)) {
            logLines[logLines.length-1] += `; ${ret.body.length} element(s) in response body array`;
        }

        const LOG_NON_ERROR_RESPONSES = false;
        if (ret.is4xx || ret.is5xx || LOG_NON_ERROR_RESPONSES) {
            logLines.push(`Response Body: ${JSON.stringify(ret.body, null, 4)}`);
        }
    } catch (err) {
        //logLines.push(`      Error while attempting to parse response body as JSON: `);
        //logLines.push(err.message || err);
        if (ret.is2xx || ret.is3xx) {
            logLines.push(`Response Body (not JSON): ${ret.body}`);
        }
    }

    console.log(logLines.join("\n"));
    return ret;
}

async function _get(endpoint, query = {}) {
    query = Object.entries(query).map(_encodePair).join('&'); // stupid
    if (query) { query = '?'+query; }
    const url = API_BASE_URL + endpoint + query;
    const options = {
        method: 'GET',
        headers: {},
    };
    return _fetch(url, options);
};

async function _post(endpoint, payload) {
    const url = API_BASE_URL + endpoint;
    const options = {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: payload,
    };
    return _fetch(url, options);
};

async function _postForm(endpoint, payload) {
    const url = API_BASE_URL + endpoint;
    const options = {
        method: 'POST',
        headers: {},
        body: payload,
    };
    return _fetch(url, options);
};

async function _put(endpoint, payload) {
    const url = API_BASE_URL + endpoint;
    const options = {
        method: 'PUT',
        headers: {
            'content-type': 'application/json',
        },
        body: payload,
    };
    return _fetch(url, options);
};

async function _delete(endpoint) {
    const url = API_BASE_URL + endpoint;
    const options = {
        method: 'DELETE',
        headers: {},
    };
    return _fetch(url, options);
};

async function _storeToken(body) {
    accessToken = body.token;
    refreshToken = body.refreshToken || '';
    await Promise.all([
        AsyncStorage.setItem('accessToken', accessToken),
        AsyncStorage.setItem('refreshToken', refreshToken),
    ]);
};

async function _loadToken() {
    if (accessToken == null) {
        [accessToken, refreshToken] = await Promise.all([
            AsyncStorage.getItem('accessToken'),
            AsyncStorage.getItem('refreshToken'),
        ]);
    }
    return accessToken;
};

async function _refreshToken() {
    const payload = {
        refresh_token: refreshToken,
    };
    const res = await _post('/RefreshToken', payload);
    if (res.status == 200) {
        _storeToken(res.body);
        return true;
    }
    return false;
};

// ===================================EXPORTS===================================

export const rezUnloadToken = async () => {
    accessToken = null;
    refreshToken = null;
    await Promise.all([
        AsyncStorage.removeItem('accessToken'),
        AsyncStorage.removeItem('refreshToken'),
    ]);
};

export const rezAuthenticate = async (email_address, password) => {
    const payload = {
        email_address,
        password,
    };
    const res = await _post('/Authenticate', payload);

    const ret = {};
    if (res.status == 200) {
        await _storeToken(res.body);
        ret.user = res.body.user;
    } else if (res.status == 404) {
        ret.error = 'Email/password combination is incorrect.';
    } else {
        ret.error = 'Server Error';
    }
    return ret;
};

export const rezIsLoggedIn = async () => {
    const token = await _loadToken();
    return !!token;
};

export const rezGetMemberships = async () => {
    const res = await _withRetry(() => _get('/GetMemberships'));

    if (res.status == 200) {
        return res.body.memberships;
    }
    return null;
};

export const rezGetUserDetails = async () => {
    const res = await _withRetry(() => _get('/GetUserDetails'));

    if (res.status == 200) {
        return res.body.user;
    }
    return null;
};

export const rezSelectAccountContext = async (account_id) => {
    const payload = {
        account_id,
    };
    const res = await _withRetry(() => _post('/SelectAccountContext', payload));

    if (res.status == 200) {
        await _storeToken(res.body);
        return true;
    }
    return null;
};

export const rezGetAnnouncements = async () => {
    const res = await _withRetry(() => _get('/GetAnnouncements'));

    if (res.status == 200) {
        return res.body.announcements;
    }
    return null;
};

export const rezGetDocuments = async () => {
    const res = await _withRetry(() => _get('/GetDocuments'));

    if (res.status == 200) {
        return res.body.documents;
    }
    return null;
};

export const rezGetMembers = async () => {
    const res = await _withRetry(() => _get('/GetMemberList'));

    if (res.status == 200) {
        return res.body.members;
    }
    return null;
};

export const rezGetMemberUnitAssignments = async (id) => {
    const res = await _withRetry(() => _get(`/GetMemberUnitAssignments/${id}`));

    if (res.status == 200) {
        return res.body.unit_assignments;
    }
    return null;
};

export const rezGetBuildings = async () => {
    const res = await _withRetry(() => _get('/GetBuildingList'));

    if (res.status == 200) {
        return res.body.buildings;
    }
    return null;
};

export const rezGetBuildingDirectory = async (slug) => {
    const res = await _withRetry(() => _get(`/GetBuildingDirectory/${slug}`));

    if (res.status == 200) {
        return res.body.directory;
    }
    return null;
}

export const rezGetUnits = async () => {
    const res = await _withRetry(() => _get('/GetUnits'));

    if (res.status == 200) {
        return res.body.buildings;
    }
    return null;
};

export const rezGetUnitDetails = async (slug) => {
    const res = await _withRetry(() => _get(`/GetUnitDetails/${slug}`));

    if (res.status == 200) {
        return res.body.unit;
    }
    return null;
};

export const rezGetUnitMemberAssignments = async (slug) => {
    const res = await _withRetry(() => _get(`/GetUnitMemberAssignments/${slug}`));

    if (res.status == 200) {
        return res.body.member_assignments;
    }
    return null;
};
