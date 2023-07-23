/* eslint-disable react/prop-types */

import { createContext, useReducer, useContext } from 'react';
import Cookies from 'universal-cookie';
import { getAccount, createService, refreshService, deleteService, createDashboard, updateDashboard, deleteDashboard,
  addWidget, modifyWidget, refreshWidget, deleteWidget, moveWidget, getDashboard } from '~/libs/requests';
import { obtainPosition } from './helpers';

/****************************************
  Initial state
****************************************/

const initialState = {
  user: null,
  dashboard: null,
  dashboards: [],
  services: [],
  serviceLinks: [],
  settings: {},
  showDrawer: false,

  modals: {
    datasources: false,
    account: false,
    login: false,
    addwidget: false,
    createdashboard: false,
    adddatasource: false
    //modifyDashboard: false
  }
};

/****************************************
  Action types
****************************************/

const TOGGLE_DRAWER = 'TOGGLE_DRAWER';
const USER_UPDATED = 'USER_UPDATED';
const SERVICES_UPDATED = 'SERVICES_UPDATED';
const DASHBOARDS_UPDATED = 'DASHBOARDS_UPDATED';
const DASHBOARD_CHANGED = 'DASHBOARD_CHANGED';
const DASHBOARD_DELETED = 'DASHBOARD_DELETED';
const TOGGLE_MODAL = 'TOGGLE_MODAL';
const USER_DISCONNECTED = 'USER_DISCONNECTED';

/****************************************
  Global reducer
****************************************/

const globalStateReducer = (state, action) => {
  switch (action.type) {
    
    case TOGGLE_DRAWER: {
      return {...state, showDrawer: !state.showDrawer };
    }

    case USER_UPDATED: {
      let { user, account, dashboard = null } = action.payload;
      if (!user) {
        return {...state, user: null, dashboard: null, dashboards: [], services: [], serviceLinks: [], settings: {} };
      }
      const { dashboards, services, serviceLinks, settings } = account;
      if (!dashboard) {
        dashboard = dashboards?.length > 0 ? dashboards[0] : null;
      }
      return {...state, user, dashboard, dashboards, services, serviceLinks, settings };
    }

    case SERVICES_UPDATED: {
      const { services } = action.payload;
      return {...state, services };
    }

    case DASHBOARDS_UPDATED: {
      const { dashboard: db } = action.payload;
      const dashboards = [ ...state.dashboards.filter(x => x._id.toString() !== db._id.toString()), db ];
      return {...state, dashboard: state.dashboard._id === db._id ? db : state.dashboard, dashboards };
    }

    case DASHBOARD_CHANGED: {
      const { dashboard } = action.payload;
      return {...state, dashboard };
    }

    case USER_DISCONNECTED: {
      return {...initialState };
    }

    case DASHBOARD_DELETED: {
      const { dashId } = action.payload;
      const dashboards = [ ...state.dashboards.filter(x => x._id.toString() !== dashId) ];
      let dashboard = state.dashboard._id === dashId ? dashboards[0] : state.dashboard;
      return {...state, dashboard, dashboards };
    }

    case TOGGLE_MODAL: {
      let { modal, enable } = action;
      if (state.modals[modal] === undefined) {
        alert(`The modal ${modal} doesn't exist.`);
        console.error(`The modal ${modal} doesn't exist.`);
        return state;
      }
      if (enable === undefined) {
        enable = !state.modals[modal];
      }
      const freshState = { ...state };
      freshState.modals = { ...freshState.modals };
      freshState.modals[modal] = enable;
      return freshState;
    }

    default:
      return state;
  }
};

/****************************************
  Global state
****************************************/

const GlobalStateContext = createContext();

const useGlobalState = () => {
  const actions = {};
  const [state, dispatch] = useContext(GlobalStateContext);

  actions.toggleDrawer = () => {
    dispatch({ type: TOGGLE_DRAWER });
  };

  actions.setUser = async (user, account, dashId) => {
    const { dashboards } = account;
    // Dashboard is the one picked by the router (URL), or the latest one.
    let dashboard = null;
    if (dashId) {
      dashboard = dashboards.find(x => x._id.toString() === dashId.toString());
      if (!dashboard && user.accountType === 'admin') {
        const res = await getDashboard(dashId);
        dashboard = res.success ? res.dashboard : null;
        console.log('Admin Mode: Try to load dashboard for debug.', dashId, dashboard);
      }
    }
    dispatch({ type: USER_UPDATED, payload: { user, account, dashboard } });
  };

  actions.disconnectUser = () => {
    const cookies = new Cookies();
    cookies.remove('nekometrics_token', { path: '/' });
    dispatch({ type: USER_DISCONNECTED });
  };

  actions.createService = async (service) => {
    let res = await createService(service);
    if (res.success) {
      const service = res.service;
      const services = [ ...state.services, service ];
      dispatch({ type: SERVICES_UPDATED, payload: { services: services } });
    }
    else {
      console.log('actions.createServices', res);
      alert('Error while creating the service.');
    }
  }

  actions.refreshServices = async () => {
    let res = await getAccount();
    if (res.success) {
      const services = res.services;
      dispatch({ type: SERVICES_UPDATED, payload: { services: services } });
    }
    else {
      console.log('actions.refreshServices', res);
      alert('Error while refreshing services.');
    }
  }

  actions.refreshService = async (serviceId) => {
    let res = await refreshService(serviceId);
    if (res.success) {
      const services = [ res.service, ...state.services.filter(x => x._id.toString() !== serviceId) ];
      dispatch({ type: SERVICES_UPDATED, payload: { services: services } });
    }
    else {
      alert(res.message);
    }
  }

  actions.deleteService = async (serviceId) => {
    let res = await deleteService(serviceId);
    if (res.success) {
      const services = [ ...state.services.filter(x => x._id.toString() !== serviceId) ];
      dispatch({ type: SERVICES_UPDATED, payload: { services: services } });
    }
    else {
      alert(res.message);
    }
  }

  actions.createDashboard = async (newDashboard) => {
    let res = await createDashboard(newDashboard);
    if (res.success) {
      const { dashboard } = res; 
      await dispatch({ type: DASHBOARDS_UPDATED, payload: { dashboard } });
      dispatch({ type: DASHBOARD_CHANGED, payload: { dashboard } });
    }
    else {
      console.log('actions.createDashboard', res);
      alert('Error while creating the dashboard.');
    }
  }

  actions.updateDashboard = async (updatedDashboard) => {
    let res = await updateDashboard(updatedDashboard);
    if (res.success) {
      const { dashboard } = res; 
      dispatch({ type: DASHBOARDS_UPDATED, payload: { dashboard } });
    }
    else {
      console.log('actions.createDashboard', res);
      alert('Error while creating the dashboard.');
    }
  }

  actions.changeDashboard = async (dashboardId) => {
    let dashboard = state.dashboards.find(x => x._id.toString() === dashboardId.toString());
    if (!dashboard && state.user.accountType === 'admin') {
      const res = await getDashboard(dashboardId);
      dashboard = res.success ? res.dashboard : null;
      console.log('Admin Mode: Try to load dashboard for debug.', dashboardId, dashboard);
    }
    if (dashboard) {
      dispatch({ type: DASHBOARD_CHANGED, payload: { dashboard } });
    }
    else {
      console.log('actions.changeDashboard', dashboardId);
      alert('Error while changing dashboard.');
    }
  }

  actions.deleteDashboard = async (dashId) => {
    let res = await deleteDashboard(dashId);
    if (res.success) {
      dispatch({ type: DASHBOARD_DELETED, payload: { dashId } });
    }
    else {
      console.log('actions.deleteDashboard', res);
      alert('Error while deleting the dashboard.');
    }
  }


  actions.addWidget = async (service, type) => {
    const { dashboard } = state;
    const { widgets } = dashboard;
    const { x, y, w, h } = obtainPosition(widgets);
    let widget = { x, y, w, h, service, type };
    let res = await addWidget(dashboard._id, widget);
    if (res.success) {
      const newDashboard = { ...dashboard, widgets: [ ...dashboard.widgets, res.widget ] }; 
      dispatch({ type: DASHBOARDS_UPDATED, payload: { dashboard: newDashboard } });
    }
    else {
      console.log('actions.addWidget', res);
      alert('Error while adding widget.');
    }
  };

  actions.moveWidget = async (widgetId, dashboardId) => {
    const { dashboard, dashboards } = state;
    const widget = dashboard.widgets.find(x => x._id === widgetId);
    const targetDashboard = dashboards.find(x => x._id === dashboardId);
    if (!widget || !targetDashboard) {
      alert("A widget and targetDashboard are required!");
      return;
    }    
    // Calculate the position in the new dashboard
    const { x, y } = obtainPosition(targetDashboard.widgets);

    let res = await moveWidget(widgetId, dashboard._id, dashboardId, x, y);
    if (res.success) {  
      // Add to target
      widget.x = x;
      widget.y = y;
      console.log({ targetDashboard, widget });
      const newTargetDb = { ...targetDashboard, widgets: [ ...targetDashboard.widgets, widget ] };
      await dispatch({ type: DASHBOARDS_UPDATED, payload: { dashboard: newTargetDb } });
      // Remove from source
      const currentDb = { ...dashboard, widgets: [ ...dashboard.widgets.filter(x => x._id !== widgetId) ] };
      await dispatch({ type: DASHBOARDS_UPDATED, payload: { dashboard: currentDb } });
    }
    else {
      console.log('actions.moveWidget', res);
      alert('Error while moving widget.');
    }
  }

  actions.modifyWidget = async (widgetId, widget) => {
    const { dashboard } = state;
    let res = await modifyWidget(widgetId, widget);
    if (res.success) {
      const newDashboard = { ...dashboard, widgets: [ ...dashboard.widgets.filter(x => x._id !== widgetId), widget ] };
      dispatch({ type: DASHBOARDS_UPDATED, payload: { dashboard: newDashboard } });
    }
    else {
      console.log('actions.modifyWidget', res);
      alert('Error while modifying widget.');
    }
  }

  actions.refreshWidget = async (widgetId) => {
    const { dashboard } = state;
    let res = await refreshWidget(widgetId);
    if (res.success) {
      const { widget } = res;
      const newDashboard = { ...dashboard, widgets: [ ...dashboard.widgets.filter(x => x._id !== widgetId), widget ] };
      dispatch({ type: DASHBOARDS_UPDATED, payload: { dashboard: newDashboard } });
    }
    else {
      console.log('actions.refreshWidget', res);
      alert('Error while refreshing widget.');
    }
  }

  actions.deleteWidget = async (widgetId) => {
    let res = await deleteWidget(state.dashboard._id, widgetId);
    if (res.success) {
      const newDashboard = { ...state.dashboard, widgets: [ ...state.dashboard.widgets.filter(x => x._id !== widgetId) ] };
      dispatch({ type: DASHBOARDS_UPDATED, payload: { dashboard: newDashboard } });
    }
    else {
      console.log('actions.deleteWidget', res);
      alert('Error while deleting widget.');
    }
  }

  // UI ACTIONS
  actions.toggleModal = (modal, enable = undefined) => { dispatch({ type: TOGGLE_MODAL, modal, enable }); };

  return { ...state, ...actions };
};

/****************************************
  Global state provider
****************************************/

export const GlobalStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer( globalStateReducer, initialState );
  return (<GlobalStateContext.Provider value={[state, dispatch]}>{children}</GlobalStateContext.Provider>);
};

export default useGlobalState;