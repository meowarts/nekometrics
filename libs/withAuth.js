/* eslint-disable react/prop-types */

import { useEffect } from 'react';
import Cookies from "universal-cookie";

import useGlobalState from './context';
import { getStatus, getAccount } from '../libs/requests';

const withAuth = (WrappedComponent) => {
  
  const FuncComponent = ({ children, ...props }) => {
    const { user, setUser } = useGlobalState(); 
    useEffect(() => {
      if (!user && props.user && props.account) {
        delete props.user.password;
        setUser(props.user, props.account, props.dashId);
      }
    });

    return (<WrappedComponent {...props}>{children}</WrappedComponent>);
  };

  FuncComponent.getInitialProps = async (ctx) => {
    let props = {};

    if (ctx && ctx.req) {
      let cookies = new Cookies(ctx.req?.headers?.cookie);
      if (cookies.get('nekometrics_token')) {
        const res = await getStatus(ctx.req.headers.cookie);
        if (res.success) {
          const account = await getAccount(ctx.req.headers.cookie);
          props = { ...props, user: res.user, account: account, dashId: ctx.query && ctx.query.dashId ? ctx.query.dashId : null };
        }
        else {
          props = { ...props, user: null, account: null };
        }
      }
    }

    // If Page/Component has a `getInitialProps`, we should call it... after? :)
    props = { ...props, ...(WrappedComponent.getInitialProps && (await WrappedComponent.getInitialProps(ctx))), withAuth: true };

    return props;
  }

  return FuncComponent;
}

export default withAuth;