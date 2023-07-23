import { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { DataGrid } from '@material-ui/data-grid';
import { Breadcrumbs, Button, Typography } from '@material-ui/core';
import styled from 'styled-components';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import SentimentVeryDissatisfiedIcon from '@material-ui/icons/SentimentVeryDissatisfied';
import LoyaltyIcon from '@material-ui/icons/Loyalty';
import TimerIcon from '@material-ui/icons/Timer';

import Footer from '~/components/Footer';
import Layout from '~/components/Layout';
import useSWR from 'swr';
import DayJS from 'dayjs';
import useGlobalState from '~/libs/context';
import Router from 'next/router';
import withAuth from '~/libs/withAuth';

const fetcher = (...args) => fetch(...args).then(res => { return res.json(); });
const dateFormatter = x => DayJS(x.value).format('YYYY-MM-DD');

const StyledBreadcrumbs = styled.div`
	margin-top: 40px;

	.MuiBreadcrumbs-ol {
		color: white;
		font-size: 15px !important;
	}

	.current {
		font-weight: bold;
		font-size: 15px !important;
	}

	.clickable {
		cursor: pointer;
	}
`;

const StyledDataGrid = styled(DataGrid)`
	margin-top: 10px;
	background: #ffebff;

	.MuiDataGrid-checkboxInput {
	}

	.MuiDataGrid-booleanCell {
	}

	.MuiDataGrid-columnHeaderWrapper {
    background: #ffffff;

		.MuiDataGrid-columnHeaderTitleContainer {

			.MuiDataGrid-columnHeaderTitle {
			}
		}
	}

	.MuiDataGrid-cell {
	}

	.MuiDataGrid-footer {
	}
`;

const Admin = () => {
	const css = useStyles();
	const { user: realUser, changeDashboard } = useGlobalState(); 
	const [user, setUser] = useState();
	const { data: usersData } = useSWR('/api/admin/users', fetcher);
	const { data: dashboardsData } = useSWR(user ? `/api/admin/dashboards?userId=${user._id}` : null, fetcher);
	const users = usersData ? usersData.users : [];
	const dashboards = dashboardsData ? dashboardsData.dashboards : [];
	const mode = user ? 'dashboards' : 'users';

	const onReset = () => {
		setUser();
	}

	const userColumns = [
		// eslint-disable-next-line react/display-name
		{ field: 'email', headerName: 'User', width: 160, renderCell: e => (
			<>
				{e.row.isActive && (e.row.accountType === 'admin' || e.row.accountType === 'friend') && 
					<LoyaltyIcon color="secondary" style={{ marginRight: 5 }} />}
				{e.row.isActive && e.row.accountType === 'customer' && 
					<MonetizationOnIcon color="secondary" style={{ marginRight: 5 }} />}
				{e.row.isExpiring && <TimerIcon color="primary" style={{ marginRight: 5 }} />}
				{!e.row.isActive && <SentimentVeryDissatisfiedIcon color="disabled" style={{ marginRight: 5 }} />}
				<span>{e.row.email}</span>
			</>
		) },
		// { field: 'isActive', headerName: 'Active', type: 'boolean', width: 120, visible: false },
		{ field: 'daysLeft', headerName: 'Left', type: 'number', width: 110 },
		{ field: 'maxWidgets', headerName: 'Widgets', type: 'number', width: 130 },
		// { field: 'isExpiring', headerName: 'Expiring', type: 'boolean', width: 120 },
		// { field: 'accountType', headerName: 'Type', width: 120 },
		{ field: 'createdOn', headerName: 'Created', width: 140, valueFormatter: dateFormatter },
		// { field: 'expiresOn', headerName: 'Expires', width: 140, valueFormatter: dateFormatter },
		// { field: 'updatedOn', headerName: 'Updated', width: 140, valueFormatter: dateFormatter },
		{ field: 'accessedOn', headerName: 'Accessed', width: 140, valueFormatter: dateFormatter },
		// eslint-disable-next-line react/display-name
		{ field: 'actions', headerName: 'Actions', width: 140, renderCell: e => (
			<Button variant="contained" color="primary" size="small" 
				onClick={() => setUser(e.row)}>Dashboards</Button>
			)
		}
	];
	
	const dashboardColumns = [
		{ field: 'name', headerName: 'Name', width: 240 },
		{ field: 'widgets', headerName: 'Widgets', width: 130, valueFormatter: x => x.value.length },
		// eslint-disable-next-line react/display-name
		{ field: 'actions', headerName: 'Actions', width: 260, renderCell: e => (
			<Button variant="contained" color="primary" size="small" 
				onClick={() => { changeDashboard(e.row._id); Router.push(`/db/${e.row._id}`); }}>Open Dashboard</Button>
			)
		}
	];

	const currentColumns = mode === 'dashboards' ? dashboardColumns : userColumns;
	const currentData = mode === 'dashboards' ? dashboards : users;

	return (
		<Layout usePaper={false}>
			{realUser && realUser.accountType === 'admin' && <>
				<h1 className={css.pageTitle}><span className={css.gradient}>Admin</span></h1>
				<StyledBreadcrumbs>
					<Breadcrumbs>
						<div href="/" onClick={onReset} className="clickable">Users</div>
						{user && <div>{user.email}</div>}
						{mode === 'dashboards' && <Typography className="current">Dashboards</Typography>}
					</Breadcrumbs>
				</StyledBreadcrumbs>
				<div>
					<StyledDataGrid rows={currentData} columns={currentColumns} size="small"
					pageSize={10} getRowId={(row) => row._id} autoHeight rowHeight={35} />
				</div>
			</>}
			<Footer/>
		</Layout>
	);
}

const useStyles = makeStyles(theme => ({
	pageTitle: {
		textAlign: 'center',
		margin: '60px 0'
	},
	gradient: theme.gradient
}));

export default withAuth(Admin);