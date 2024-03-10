import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { expo } from './app.json';

function _getApiBaseUrl() {
    const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || '';
    return baseUrl.trim() || 'https://api.rezidy.com';
}
const API_BASE_URL = _getApiBaseUrl();
const API_KEY = '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d';

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
    options.headers['x-rezidy-app-platform'] = Platform.OS;
    options.headers['x-rezidy-app-version'] = expo.version;
    options.headers['x-rezidy-client-token'] = API_KEY;
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
            logLines.push(`Request Body (FORM): ${JSON.stringify(logBody, null, 4)}`);
        } else {
            logLines.push(`Request Body: ${JSON.stringify(logBody, null, 4)}`);
            options.body = JSON.stringify(options.body);
        }
    }

    let res = null;
    try {
        res = await fetch(url, options);
    } catch (err) {
        res = {
            url: url,
            status: 1000,
            headers: {map: {}},
            text: () => err.message,
        };
    }
    
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

        const LOG_NON_ERROR_RESPONSES = false;
        if (ret.is4xx || ret.is5xx || LOG_NON_ERROR_RESPONSES) {
            logLines.push(`Response Body: ${JSON.stringify(ret.body, null, 4)}`);
        }
    } catch (err) {
        logLines.push(`Response Body (not JSON): ${ret.body}`);
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
    const res = await _post('/v2/RefreshToken', payload);
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

export const rezSignup = async (user) => {
    const payload = {
        first_name: user.firstName,
        last_name: user.lastName,
        phone_number: user.phone,
        email_address: user.email,
        password: user.password,
    };
    const res = await _post('/v2/Signup', payload);

    const ret = {};
    if (res.status == 200) {
        await _storeToken(res.body);
        ret.user = res.body.user;
    } else if (res.status == 412) {
        ret.error = res.body;
    } else {
        ret.error = 'Server Error';
    }
    return ret;
}

export const rezDeleteMyself = async () => {
    const res = await _delete('/v2/DeleteMyself');

    const ret = {};
    if (res.status == 204) {
        ret.error = false;
    } else {
        ret.error = res.body;
    }
    return ret;
}

export const rezAuthenticate = async (email_address, password) => {
    const payload = {
        email_address,
        password,
    };
    const res = await _post('/v2/Authenticate', payload);

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
    const res = await _withRetry(() => _get('/v2/GetMemberships'));

    if (res.status == 200) {
        return res.body.memberships;
    }
    return null;
};

export const rezGetUserDetails = async () => {
    const res = await _withRetry(() => _get('/v2/GetUserDetails'));

    if (res.status == 200) {
        return res.body.user;
    }
    return null;
};

export const rezSelectAccountContext = async (account_id) => {
    const payload = {
        account_id,
    };
    const res = await _withRetry(() => _post('/v2/SelectAccountContext', payload));

    if (res.status == 200) {
        await _storeToken(res.body);
        return true;
    }
    return null;
};

export const rezGetAnnouncements = async () => {
    const res = await _withRetry(() => _get('/v2/GetAnnouncements'));

    if (res.status == 200) {
        return res.body.announcements;
    }
    return null;
};

export const rezGetDocuments = async () => {
    const res = await _withRetry(() => _get('/v2/GetDocuments'));

    if (res.status == 200) {
        return res.body.documents;
    }
    return null;
};

export const rezGetMyInvoices = async () => {
    const res = await _withRetry(() => _get('/v2/GetMyInvoices'));

    if (res.status == 200) {
        return res.body.invoices;
    }
    return null;
};

export const rezGetMembers = async () => {
    const res = await _withRetry(() => _get('/v2/GetMemberList'));

    if (res.status == 200) {
        return res.body.members;
    }
    return null;
};

export const rezGetMemberUnitAssignments = async (id) => {
    const res = await _withRetry(() => _get(`/v2/GetMemberUnitAssignments/${id}`));

    if (res.status == 200) {
        return res.body.unit_assignments;
    }
    return null;
};

export const rezGetBuildings = async () => {
    const res = await _withRetry(() => _get('/v2/GetBuildingList'));

    if (res.status == 200) {
        return res.body.buildings;
    }
    return null;
};

export const rezGetBuildingDirectory = async (slug) => {
    const res = await _withRetry(() => _get(`/v2/GetBuildingDirectory_v2/${slug}`));

    if (res.status == 200) {
        return res.body.directory;
    }
    return null;
}

export const rezGetUnits = async () => {
    const res = await _withRetry(() => _get('/v2/GetUnits'));

    if (res.status == 200) {
        return res.body.buildings;
    }
    return null;
};

export const rezGetUnitDetails = async (slug) => {
    const res = await _withRetry(() => _get(`/v2/GetUnitDetails/${slug}`));

    if (res.status == 200) {
        return res.body.unit;
    }
    return null;
};

export const rezGetUnitMemberAssignments = async (slug) => {
    const res = await _withRetry(() => _get(`/v2/GetUnitMemberAssignments/${slug}`));

    if (res.status == 200) {
        return res.body.member_assignments;
    }
    return null;
};

export const rezUploadImageViaForm = async (uri) => {
    const ext = uri.substring(uri.lastIndexOf('.') + 1);
    const file = {
        uri,
        name: uri.substring(uri.lastIndexOf('/') + 1),
        type: `image/${ext}`,
    };
    if (file.type === 'image/jpg') {
        file.type = 'image/jpeg';
    }

    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', 'attachment');

    const res = await _withRetry(() => _postForm('/v2/UploadFile', fd));
    if (res.status == 200) {
        return res.body.file;
    }
    return {
        error: true,
        code: res.status,
    }
};

export const rezSaveCTA = async (cta) => {
    const payload = {
        ...cta,
    };
    const res = await _post('/v2/SaveCTA', payload);
    if (res.status == 200) {
        return res.body;
    }
    return null;
};
