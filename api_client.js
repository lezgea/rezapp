import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

function _getApiBaseUrl(env) {
    if (env == 'local') {
        return 'http://192.168.2.13:3010/v2';
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
    refreshToken = body.refreshToken;
    await Promise.all([
        AsyncStorage.setItem('accessToken', accessToken),
        //AsyncStorage.setItem('refreshToken', refreshToken),
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
    const payload = { refreshToken };
    const res = await _post('/auth/refresh-token', payload);
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
        _storeToken(res.body);
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
        _storeToken(res.body);
        return true;
    }
    return null;
};

export const szCreateAccountWithEmailAndPassword = async(userDetails) => {
    const payload = {...userDetails};
    const res = await _post('/accounts', payload);

    const ret = {};
    if (res.status == 201) {
        _storeToken(res.body);
        const user = _makeUser(res.body);
        ret.user = user;
    } else if (res.is4xx) {
        if (res.body.code == 'ResourceAlreadyExists') {
            ret.error = 'Email address is already in use.';
        } else {
            ret.error = 'Unknown error';
        }
    } else {
        ret.error = 'Server error';
    }
    return ret;
};

export const szRequestPasswordReset = async (email) => {
    const payload = { email };
    const res = await _post('/auth/password-reset-requests', payload);

    const ret = {};
    if (res.status == 200) {
        ret.error = null;
    }
    if (res.status == 400) {
        ret.error = 'Email address is invalid.';
    }
    if (res.status == 404) {
        // If a 404 error is received, that means there is no account
        // associated with that email address. However, we do not want
        // to let the user know that because that is a security vulnerability.
        ret.error = null;
    }
    return ret;
};

export const szSignUp = async (userDetails) => {
    const payload = { ...userDetails };
    const res = await _post('/accounts', payload);

    if (res.status == 201) {
        _storeToken(res.body);
        const user = _makeUser(res.body);
        return {user};
    }
    return {};
};

export const szGetFirebaseToken = async () => {
    const res = await _withRetry(() => _get('/auth/firebase/token'));
    if (res.status == 200) {
        return res.body.token;
    }
    return null;
};

export const szGetPusherAuth = async (socketId, channelName) => {
    const payload = {
        socket_id: socketId,
        channel_name: channelName,
    };
    const res = await _withRetry(() => _post(`/auth/pusher/token`, payload));

    if (res.status == 200) {
        return res.body;
    }
    return null;
};

export const szSaveDeviceIdLocally = async (deviceId, platform, version) => {
    const payload = {
        deviceId,
        platform,
        version,
    };
    const payloadJsonStr = JSON.stringify(payload);
    return AsyncStorage.setItem('deviceId', payloadJsonStr);
};

export const szSaveDeviceIdRemotely = async () => {
    const payloadJsonStr = await AsyncStorage.getItem('deviceId');
    const payload = JSON.parse(payloadJsonStr);
    if (payload) {
        const res = await _withRetry(() => _post('/devices/register', payload));
        if (res.status == 204) {
            return true;
        }
    }

    return false;
};

export const szRemoveDevice = async () => {
    const payloadJsonStr = await AsyncStorage.getItem('deviceId');
    const payload = JSON.parse(payloadJsonStr);
    const deviceId = payload.deviceId;
    const res = await _withRetry(() => _delete(`/devices/mine/${deviceId}`));
    return res.status == 204;
};

export const szGetConversations = async (skip=0, take=15) => {
    const query = { skip, take };
    const res = await _withRetry(() => _get('/rooms', query));

    if (res.status == 200) {
        for (let room of res.body) {
            if (room.lastMessage) {
                room.updated = room.lastMessage.created;
            }
        }
        return res.body;
    }
    return null;
};

export const szSendMessage = async (convoId, text, files=[], replyToId='', attributes=[]) => {
    const payload = {
        roomId: convoId,
        text,
        files,
        replyTo: replyToId,
        forwarded: false,
        attributes,
    };
    const res = await _withRetry(() => _post('/messages', payload));

    const ret = {};
    if (res.status == 201) {
        ret.message = res.body;
        ret.success = true;
    } else {
        ret.success = false;
        ret.error = res.body.message;
    }
    return ret;
};

export const szGetMessages = async (convoId, skip=0, take=100) => {
    const query = { skip, take };
    const res = await _withRetry(() => _get(`/messages/findByRoom/${convoId}`, query));

    if (res.status == 200) {
        return res.body;
    }
    return null;
};

export const szDeleteMessage = async (messageId) => {
    const res = await _withRetry(() => _delete(`/messages/${messageId}`));
    return res.status == 204;
};

export const szGetUserSummary = async (userId) => {
    const res = await _withRetry(() => _get(`/accounts/${userId}/summary`));
    if (res.status == 200) {
        const account = res.body;
        const user = _makeUser({ account });
        return user;
    }
    return null;
};

export const szGetUserDetails = async (userId) => {
    const res = await _withRetry(() => _get(`/profile/${userId}`));
    if (res.status == 200) {
        res.body.experience = res.body.experience.filter(ex => !!ex.company);
        res.body.education = res.body.education.filter(ed => !!ed.university);
        return res.body;
    }
    return null;
};

export const szGetUserProfile = async (userId) => {
    const [summary, details, conn] = await Promise.all([
        szGetUserSummary(userId),
        szGetUserDetails(userId),
        szGetConnectionStatus(userId),
    ]);
    if (summary && details && conn) {
        const profile = {
            ...summary,
            ...details,
            connStatus: conn.connStatus,
            connId: conn.connId,
        };
        return profile;
    }
    return null;
};

export const szGetCompanySummary = async (companyId) => {
    const res = await _withRetry(() => _get(`/companies/${companyId}/summary`));
    if (res.status == 200) {
        return res.body;
    }
    return null;
};

export const szGetCompanyProducts = async (companyId) => {
    const query = {skip:0, take:100};
    const res = await _withRetry(() => _get(`/products/findByCompany/${companyId}`, query));
    if (res.status == 200) {
        for (let p of res.body) {
            if (p.images.length == 0) {
                p.imageUrl = '';
            } else {
                p.imageUrl = p.images[0].url;
            }
        }
        return res.body;
    }
    return null;
};

export const szGetCompanyMembers = async (companyId) => {
    const res = await _withRetry(() => _get(`/companies/${companyId}/members`));
    if (res.status == 200) {
        for (let m of res.body) {
            if (!m.account.location) {
                m.account.location = {
                    displayText: 'an undisclosed location',
                }
            }
        }
        return res.body;
    }
    return null;
};

export const szGetCompanyProfile = async (companyId) => {
    const [summary, products, members] = await Promise.all([
        szGetCompanySummary(companyId),
        szGetCompanyProducts(companyId),
        szGetCompanyMembers(companyId),
    ]);
    if (summary && members) {
        const profile = {
            ...summary,
            products,
            members,
        };
        return profile;
    }
    return null;
};

export const szUploadFileViaForm = async (uri, mime, folder) => {
    const file = {
        uri,
        name: uri.substring(uri.lastIndexOf('/') + 1),
        type: mime,
    };

    const fd = new FormData();
    fd.append("folder", folder);
    fd.append("media", file);
    const res = await _withRetry(() => _postForm('/files/upload', fd));
    if (res.status == 200) {
        return res.body;
    }
    if (res.status == 413) {
        return {
            error: 'File too large', // TODO: localize?
        }
    }
    return {
        error: 'Server error', // TODO: localize?
    };
};

export const szUpdateUser = async (updates) => {
    const currentUser = await szGetAccountData();
    if (!currentUser) {
        return null;
    }

    const payload = {
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        phone: currentUser.phone,
        picture: currentUser.picture,
        location: currentUser.location,
        slug: currentUser.slug,
        description: currentUser.description,
        ...updates,
    };
    const res = await _withRetry(() => _put('/accounts/updateGeneralInfo', payload));
    if (res.status == 200) {
        return res.body;
    }
    return null;
}

export const szGetConnections = async (flow) => {
    const query = { flow };
    const res = await _withRetry(() => _get('/connections', query));

    if (res.status == 200) {
        const connections = [];
        const seenUserIds = {};
        for (let c of res.body) {
            if (!c || !c.connection) {
                continue;
            }

            if (seenUserIds[c.connection.id]) {
                continue;
            }
            seenUserIds[c.connection.id] = true;

            if (flow == 'sent') {
                // "Pending" status is ambiguous.
                // Are they waiting on me to accept? Or am I waiting on them?
                c.status = 'Sent';
            }

            c.user = {
                uid: c.connection.id,
                firstName: c.connection.firstName,
                lastName: c.connection.lastName,
                fullName: `${c.connection.firstName} ${c.connection.lastName}`,
                image: c.connection.picture,
            };
            connections.push(c);
        }
        connections.sort((a, b) => new Date(b.created) - new Date(a.created));
        return connections;
    }
    return null;
};

export const szGetConnectionStatus = async (userId) => {
    const res = await _withRetry(() => _get(`/connections/findByUser/${userId}`));
    if (res.status == 200) {
        const conn = res.body.connection;
        if (conn) {
            if (conn.status == 'Pending') {
                if (conn.sender === userId) {
                    res.body.connStatus = 'Awaiting Your Response';
                } else if (conn.receiver === userId) {
                    res.body.connStatus = 'Awaiting Their Response';
                }
            } else {
                res.body.connStatus = conn.status;
            }
            res.body.connId = conn.id;
        } else {
            res.body.connStatus = 'Not Found';
        }
        return res.body;
    }
    return null;
};

export const szAcceptConnection = async (connectionId) => {
    const payload = {
        status: 'Accepted',
    };
    const res = await _withRetry(() => _put(`/connections/${connectionId}`, payload));
    if (res.is2xx) {
        return res.body;
    }
    return null;
};

export const szRemoveConnection = async (connectionId) => {
    const res = await _withRetry(() => _delete(`/connections/${connectionId}`));
    return res.status == 204;
};

export const szSendConnection = async (userId, message = undefined) => {
    const payload = {
        receiver: userId,
        message: message,
    };
    const res = await _withRetry(() => _post('/connections', payload));
    if (res.is2xx) {
        return res.body;
    }
    return null;
};

export const szGetOrCreatePrivateConversation = async (userId) => {
    const payload = {
        participants: [
            {
                uid: userId,
            }
        ],
        type: 'private',
    };
    const res = await _withRetry(() => _post('/rooms', payload));
    if (res.status == 201) {
        const room = res.body;
        if (room.lastMessage) {
            room.updated = room.lastMessage.created;
        }
        return room;
    }
    return res;
};

export const szCreateGroupConversation = async (name, userIds) => {
    const toObj = function (uid) {
        return {
            uid,
        };
    };

    const payload = {
        name,
        participants: userIds.map(toObj),
        type: 'group',
    };
    const res = await _withRetry(() => _post('/rooms', payload));
    if (res.status == 201) {
        const room = res.body;
        if (room.lastMessage) {
            room.updated = room.lastMessage.created;
        }
        return room;
    }
    return null;
};

export const szGetFeed = async (take, cursor='') => {
    const query = { take, cursor };
    const res = await _withRetry(() => _get(`/feed/load`, query));

    if (res.status == 200) {
        for (let p of res.body) {
            _injectAuthorIntoPost(p);
        }
        return res.body;
    }
    return null;
};

export const szGetFeedForHashtag = async (hashtag, take, cursor='') => {
    const query = { hashtag, take, cursor };
    const res = await _withRetry(() => _get(`/feed/hashtags`, query));

    if (res.status == 200) {
        for (let p of res.body) {
            _injectAuthorIntoPost(p);
        }
        return res.body;
    }
    return null;
};

export const szGetFeedForUser = async (userId, take, cursor='') => {
    const query = { take, cursor };
    const res = await _withRetry(() => _get(`/feed/loadPostsByUser/${userId}`, query));

    if (res.status == 200) {
        for (let p of res.body) {
            _injectAuthorIntoPost(p);
        }
        return res.body;
    }
    return null;
};

export const szGetFeedForCompany = async (companyId, take, cursor='') => {
    const query = { take, cursor };
    const res = await _withRetry(() => _get(`/feed/loadPostsByCompany/${companyId}`, query));

    if (res.status == 200) {
        for (let p of res.body) {
            _injectAuthorIntoPost(p);
        }
        return res.body;
    }
    return null;
};

export const szGetNotifications = async (kind, skip=0, take=25) => {
    const query = { kind, skip, take };
    const res = await _withRetry(() => _get(`/notifications`, query));

    if (res.status == 200) {
        return res.body;
    }
    return null;
};

export const szMarkAsRead = async (roomId, item='') => {
    const payload = {
        //msgRoomId: roomId,
        //item: '',
    };
    const res = await _withRetry(() => _post(`/notifications/markRead?msgRoomId=${roomId}&item=${item}`, payload));

    if (res.status == 204) {
        return true;
    }
    return null;
};

export const szUpdateNotificationTimestamp = async () => {
    const payload = {
        type: 'notifications',
    };
    const res = await _withRetry(() => _post(`/notifications/updateTimestamp`, payload));

    if (res.status == 204) {
        return true;
    }
    return null;
};

export const szGetLikesForPost = async (postId, skip=0, take=12) => {
    const query = { skip, take };
    const res = await _withRetry(() => _get(`/likes/findByPost/${postId}`, query));

    if (res.status == 200) {
        res.body.forEach(l => {
            l.liker = {};
            if (l.user) {
                l.liker.type = 'user';
                l.liker.id = l.user.id;
                l.liker.name = `${l.user.firstName} ${l.user.lastName}`;
                l.liker.image = l.user.picture;
            } else if (l.company) {
                l.liker.type = 'company';
                l.liker.id = l.company.id;
                l.liker.name = l.company.name;
                l.liker.image = l.company.logo;
            }
        });
        return res.body;
    }
    return null;
};

export const szGetCommentsForPost = async (postId, skip=0, take=12) => {
    const query = { skip, take };
    const res = await _withRetry(() => _get(`/comments/findByPost/${postId}`, query));

    if (res.status == 200) {
        res.body.forEach(l => {
            l.author = {
                type: 'user', // TODO: verify this
                id: l.user.id,
                firstName: l.user.firstName,
                lastName: l.user.lastName,
                name: `${l.user.firstName} ${l.user.lastName}`,
                image: l.user.picture,
            };
        });
        return res.body;
    }
    return null;
};

export const szGetRepliesForComment = async (commentId, skip=0, take=12) => {
    const query = { skip, take };
    const res = await _withRetry(() => _get(`/comments/${commentId}/subcomments`, query));

    if (res.status == 200) {
        res.body.forEach(l => {
            l.author = {
                type: 'user', // TODO: verify this
                id: l.user.id,
                firstName: l.user.firstName,
                lastName: l.user.lastName,
                name: `${l.user.firstName} ${l.user.lastName}`,
                image: l.user.picture,
            };
        });
        return res.body;
    }
    return null;
};

export const szUnlike = async (likeId) => {
    const res = await _withRetry(() => _delete(`/likes/${likeId}`));
    return res.status == 204;
};

export const szLikePost = async (postId) => {
    const payload = {
        post: postId,
    };
    const res = await _withRetry(() => _post(`/likes/likePost`, payload));

    if (res.status == 200) {
        return res.body;
    }
    return null;
};

export const szAddPostComment = async (postId, root, text, image) => {
    const payload = {
        post: postId,
        root: root || null,
        text,
        attributes: [],
        image: image || null,
    };
    const res = await _withRetry(() => _post(`/comments/addPostComment`, payload));

    if (res.status == 200) {
        _injectAuthorIntoPost(res.body);
        return res.body;
    }
    return null;
};

export const szDeleteComment = async (commentId) => {
    const res = await _withRetry(() => _delete(`/comments/${commentId}`));
    return res.status == 204;
};

export const szAddPost = async (text, attachments, attributes) => {
    const payload = {
        text,
        attributes: attributes || [],
        images: attachments,
        embeededObject: null,
    };
    const res = await _withRetry(() => _post(`/feed/addPost`, payload));

    if (res.status == 200) {
        _injectAuthorIntoPost(res.body);
        return res.body;
    }
    return null;
};

export const szDeletePost = async (postId) => {
    const res = await _withRetry(() => _delete(`/feed/posts/${postId}`));
    return res.status == 204;
};

export const szGetLatestCompanies = async (n) => {
    const query = { skip:0, take:n };
    const res = await _withRetry(() => _get(`/search/companies`, query));
    if (res.status == 200) {
        return res.body;
    }
    return null;
};

export const szGetLatestProducts = async (n) => {
    const query = { skip:0, take:n };
    const res = await _withRetry(() => _get(`/search/products`, query));
    if (res.status == 200) {
        for (let p of res.body) {
            if (p.images.length == 0) {
                p.imageUrl = '';
            } else {
                p.imageUrl = p.images[0].url;
            }
        }
        return res.body;
    }
    return null;
};

export const szGetLatestRequests = async (n) => {
    const query = { skip:0, take:n };
    const res = await _withRetry(() => _get(`/search/requests`, query));
    if (res.status == 200) {
        return res.body;
    }
    return null;
};

export const szGetLatestArticles = async (n) => {
    const query = { skip:0, take:n, embeed:['company','author'] };
    const res = await _withRetry(() => _get(`/articles/popular`, query));
    if (res.status == 200) {
        for (let arti of res.body) {
            if (!arti.author) {
                arti.author = {};
            }
        }
        return res.body;
    }
    return null;
};

export const szGetFeaturedArticles = async () => {
    const query = { embeed:['company','author'] };
    const res = await _withRetry(() => _get(`/articles/featured`, query));
    if (res.status == 200) {
        return res.body;
    }
    return null;
};

export const szGetArticleData = async (slug) => {
    const res = await _withRetry(() => _get(`/articles/url/${slug}`));
    if (res.status == 200) {
        return res.body;
    }
    return null;
};

export const szGetArticleLikes = async (articleId) => {
    const res = await _withRetry(() => _get(`/likes/findStatsByPost/${articleId}`));
    if (res.status == 200) {
        return res.body;
    }
    return null;
};

export const szAddArticleComment = async (articleId, root, text, image) => {
    const payload = {
        post: articleId,
        root: root || null,
        text,
        attributes: [],
        image: image || null,
    };
    const res = await _withRetry(() => _post(`/comments/addArticleComment`, payload));

    if (res.status == 200) {
        const l = res.body;
        l.author = {
            type: 'user', // TODO: verify this
            id: l.user.id,
            firstName: l.user.firstName,
            lastName: l.user.lastName,
            name: `${l.user.firstName} ${l.user.lastName}`,
            image: l.user.picture,
        };
        return l;
    }
    return null;
};

export const szSearchCompanies = async (term) => {
    const query = { skip:0, take:100, q:term };
    const res = await _withRetry(() => _get(`/search/companies`, query));
    if (res.status == 200) {
        return res.body;
    }
    return null;
};

export const szSearchProducts = async (term) => {
    const query = { skip:0, take:100, q:term };
    const res = await _withRetry(() => _get(`/search/products`, query));
    if (res.status == 200) {
        for (let p of res.body) {
            if (p.images.length == 0) {
                p.imageUrl = '';
            } else {
                p.imageUrl = p.images[0].url;
            }
        }
        return res.body;
    }
    return null;
};

export const szSearchRequests = async (term) => {
    const query = { skip:0, take:100, q:term };
    const res = await _withRetry(() => _get(`/search/requests`, query));
    if (res.status == 200) {
        return res.body;
    }
    return null;
};

export const szSearchUsers = async (term) => {
    const query = { skip:0, take:100, q:term };
    const res = await _withRetry(() => _get(`/search/accounts`, query));
    if (res.status == 200) {
        return res.body;
    }
    return null;
};

export const szGetProductInfo = async (productId) => {
    const res = await _withRetry(() => _get(`/products/${productId}`));
    if (res.status == 200) {
        const p = res.body;

        const company = await szGetCompanySummary(p.company);
        if (company) {
            p.company = company;
        }

        if (p.images.length == 0) {
            p.imageUrl = '';
        } else {
            p.imageUrl = p.images[0].url;
        }

        return p;
    }
    return null;
};

export const szGetRequestInfo = async (requestId) => {
    const res = await _withRetry(() => _get(`/requests/${requestId}`));
    if (res.status == 200) {
        return res.body;
    }
    return null;
};

export const szGetSuggestions = async (keyword) => {
    const query = { q: keyword };
    const res = await _withRetry(() => _get(`/feed/mentiondata`, query));
    if (res.status == 200) {
        return res.body;
    }
    return null;
};
