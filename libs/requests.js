import PQueue from 'p-queue';
const CFG = require('~/config');

const GetMetricsPool = new PQueue({ concurrency: 2 });
const API_URL = CFG.app.url + '/api';

async function getStatus(cookies = null) {
  const data = await fetch(`${API_URL}/status`, { headers: { Cookie: cookies } });
  const status = await data.json();
  return status;
}

async function signUp(email, invitationCode) {
  const data = await fetch(`${API_URL}/signUp`, { method: 'POST', body: JSON.stringify({ email, invitationCode }) });
  const status = await data.json();
  return status;
}

async function signIn(email, password) {
  const data = await fetch(`${API_URL}/signIn`, { method: 'POST', body: JSON.stringify({ email, password }) });
  const status = await data.json();
  // console.log('[Requests] signIn', status);
  return status;
}

async function getAccount(cookies = null) {
  const data = await fetch(`${API_URL}/account`, { headers: { Cookie: cookies } });
  const status = await data.json();
  return status;
}

async function updateAccount(account) {
  const data = await fetch(`${API_URL}/account`, { method: 'PUT', body: JSON.stringify({ account }) });
  const status = await data.json();
  return status;
}

async function modifyPwd(password) {
  const data = await fetch(`${API_URL}/modifyPwd`, { method: 'POST', body: JSON.stringify({ password }) });
  const status = await data.json();
  return status;
}

async function resetPwd(email) {
  const data = await fetch(`${API_URL}/resetPwd`, { method: 'POST', 
    body: JSON.stringify({ email }) });
  const status = await data.json();
  return status;
}

async function createService(service) {
  const data = await fetch(`${API_URL}/service`, { method: 'POST', body: JSON.stringify(service) });
  const res = await data.json();
  return res;
}

async function createDashboard(dashboard) {
  const data = await fetch(`${API_URL}/dashboard`, { method: 'POST', body: JSON.stringify({ dashboard }) });
  const res = await data.json();
  return res;
}

async function updateDashboard(dashboard) {
  const data = await fetch(`${API_URL}/dashboard/${dashboard._id}`, { method: 'POST', body: JSON.stringify({ dashboard }) });
  const res = await data.json();
  return res;
}

async function getDashboard(dashId) {
  const data = await fetch(`${API_URL}/dashboard/${dashId}`, { method: 'GET' });
  const res = await data.json();
  return res;
}

async function deleteDashboard(dashId) {
  const data = await fetch(`${API_URL}/dashboard/${dashId}`, { method: 'DELETE' });
  const res = await data.json();
  return res;
}

async function handleOauth(query, cookies = null) {
  const data = await fetch(`${API_URL}/handleOauth`, { method: 'POST', headers: { Cookie: cookies }, body: JSON.stringify(query) });
  const res = await data.json();
  return res;
}

async function deleteService(serviceId) {
  const data = await fetch(`${API_URL}/service/${serviceId}`, { method: 'DELETE' });
  const res = await data.json();
  //console.log('[requests] deleteService', res);
  return res;
}

async function refreshService(serviceId) {
  const data = await fetch(`${API_URL}/service/${serviceId}`, { method: 'GET' });
  const res = await data.json();
  //console.log('[requests] deleteService', res);
  return res;
}

async function getMetrics(widgetId, cookies = null) {
  return GetMetricsPool.add(async () => {
    const data = await fetch(`${API_URL}/metrics/${widgetId}`, { headers: { Cookie: cookies },
      method: 'POST', body: JSON.stringify({ force: false })
    });
    return await data.json();
  });
}

async function forceGetMetrics(widgetId, cookies = null) {
  const data = await fetch(`${API_URL}/metrics/${widgetId}`, { headers: { Cookie: cookies }, 
    method: 'POST', body: JSON.stringify({ force: true })
  });
  const res = await data.json();
  //console.log('[requests] deleteService', res);
  return res;
}

async function resetMetrics(widgetId, cookies = null) {
  const data = await fetch(`${API_URL}/reset/${widgetId}`, { headers: { Cookie: cookies } });
  const res = await data.json();
  //console.log('[requests] deleteService', res);
  return res;
}

async function addWidget(dashboardId, widget) {
  const data = await fetch(`${API_URL}/dashboard/${dashboardId}/widget`, { method: 'POST', body: JSON.stringify({ widget }) });
  const newWidget = await data.json();
  //console.log('[requests] addWidget', newWidget);
  return newWidget;
}

async function deleteWidget(dashboardId, widgetId) {
  const data = await fetch(`${API_URL}/dashboard/${dashboardId}/widget/${widgetId}`, { method: 'DELETE' });
  const res = await data.json();
  //console.log('[requests] deleteWidget', res);
  return res;
}

async function moveWidget(widgetId, fromDashboardId, toDashboardId, x, y) {
  const data = await fetch(`${API_URL}/widget/${widgetId}/move`, { method: 'POST', 
    body: JSON.stringify({ fromDashboardId, toDashboardId, x, y }) });
  const res = await data.json();
  //console.log('[requests] deleteWidget', res);
  return res;
}

async function modifyWidget(widgetId, widget) {
  const data = await fetch(`${API_URL}/widget/${widgetId}`, { method: 'PUT', body: JSON.stringify({ widget }) });
  const newWidget = await data.json();
  //console.log('[requests] modifyWidget', newWidget);
  return newWidget;
}

async function refreshWidget(widgetId) {
  const data = await fetch(`${API_URL}/widget/${widgetId}`, { method: 'GET' });
  const newWidget = await data.json();
  //console.log('[requests] refreshWidget', newWidget);
  return newWidget;
}

async function contactSupport(email, name, subject, message) {
  const data = await fetch(`${API_URL}/support`, { method: 'POST', 
    body: JSON.stringify({ email, name, subject, message }) });
  const res = await data.json();
  //console.log('[requests] deleteWidget', res);
  return res;
}

async function signOut() {
  const data = await fetch(`${API_URL}/signOut`);
  const status = await data.json();
  return status;
}

export {
  signUp,
  signIn,
  resetPwd,
  modifyPwd,
  getStatus,
  getAccount,
  updateAccount,
  handleOauth,
  createService,
  deleteService,
  refreshService,
  createDashboard,
  getDashboard,
  updateDashboard,
  deleteDashboard,
  contactSupport,
  addWidget,
  resetMetrics,
  getMetrics,
  forceGetMetrics,
  modifyWidget,
  refreshWidget,
  deleteWidget,
  moveWidget,
  signOut
};