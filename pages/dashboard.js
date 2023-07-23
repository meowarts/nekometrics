import { useState, useMemo, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';

import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import { Hidden, useTheme } from '@material-ui/core';

import AddActionButton from '~/components/buttons/AddActionButton';
import Layout from '~/components/Layout';
import Assistant from '~/components/Assistant';
import WidgetsFactory from '~/components/widgets/WidgetsFactory';
import useGlobalState from '~/libs/context';
import withAuth from '~/libs/withAuth';

const Dashboard = () => {
	const css = useStyles();
	const { dashboard, modifyWidget, user, toggleModal } = useGlobalState(); 
	const [ localDashId, setLocalDashId ] = useState();
	const [ layout, setLayout ] = useState();
	const theme = useTheme();
	const router = useRouter();

	const isBackImage = dashboard?.settings?.backImageSrc ? true : null;

	useEffect(() => {
		if (router?.query?.modal) {
			toggleModal(router?.query?.modal);
		}
  }, []);

	const addActionButton = useMemo(() => (!user) ? null : (
    <AddActionButton />
  ), [ user ]);

  const onLayoutChange = async (newLayout) => {

		if (!dashboard) {
			return;
		}

		// To avoid updating the servers for widget update
		// when it's actually only a dashboard switch.
		if (localDashId !== dashboard._id) {
			setLocalDashId(dashboard._id);
			setLayout(newLayout);
			return;
		}

		// Let's check for what wwas moved and where and
		// update the server accordingly.
		let modifiedLayoutItems = [];
		for (let item of newLayout) {
			let prevItem = layout.find(x => x.i === item.i);
			if (!prevItem || prevItem.w !== item.w || prevItem.h !== item.h || prevItem.x !== item.x || prevItem.y !== item.y) {
				modifiedLayoutItems.push(item);
			}
		}
		if (modifiedLayoutItems.length) {
			setLayout(newLayout);
			for (let item of modifiedLayoutItems) {
				let widget = dashboard.widgets.find(x => x._id === item.i);
				await modifyWidget(widget._id, { ...widget, w: item.w, h: item.h, x: item.x, y: item.y });
			}
		}
	}

	const widgets = useMemo(() => {
		let widgetsToUse = (dashboard && dashboard.widgets) ? dashboard.widgets : [];
		return widgetsToUse.map(widget => 
			<div key={widget._id} className={css.widget} data-grid={{x: widget.x, y: widget.y, w: widget.w, h: widget.h}}
			style={{background: isBackImage ? theme.common.WIDGET_BACKGROUND_IMAGE : theme.common.WIDGET_BACKGROUND_SOLID}}
			>
				<WidgetsFactory widget={widget} />
			</div>
		)
	}, [css, dashboard]);

	const widgetsForMobile = useMemo(() => {
		let widgetsToUse = (dashboard && dashboard.widgets) ? dashboard.widgets : [];
		widgetsToUse = widgetsToUse.map(x => ({ ...x, w: 2 }));
		return widgetsToUse.map(widget => 
			<div key={widget._id} className={css.widget} data-grid={{x: widget.x, y: widget.y, w: widget.w, h: widget.h}}
			style={{background: isBackImage ? theme.common.WIDGET_BACKGROUND_IMAGE : theme.common.WIDGET_BACKGROUND_SOLID}}>				
				<WidgetsFactory widget={widget} />
			</div>
		)
	}, [css, dashboard]);

	const widgetsForTablet = useMemo(() => {
		let widgetsToUse = (dashboard && dashboard.widgets) ? dashboard.widgets : [];
		widgetsToUse = widgetsToUse.map(x => ({ ...x, w: 4 }));
		return widgetsToUse.map(widget => 
			<div key={widget._id} className={css.widget} data-grid={{x: widget.x, y: widget.y, w: widget.w, h: widget.h}}
			style={{background: isBackImage ? theme.common.WIDGET_BACKGROUND_IMAGE : theme.common.WIDGET_BACKGROUND_SOLID}}>
				<WidgetsFactory widget={widget} />
			</div>
		)
	}, [css, dashboard]);

  return (
		<Layout usePaper={false} headerMenu={addActionButton}>

			{!user && <Alert severity="error" style={{ margin: 10 }}>You need to be connected to access your dashboard. <a href='/'>Click here</a> to go back to the homepage.</Alert>}
			{user && <Assistant />}

			<Hidden only={['xs', 'sm']}>
				<GridLayout cols={8} rowHeight={125} width={1040} 
					onLayoutChange={onLayoutChange} isDraggable={true} isResizable={true} style={{ width: 1040 }}>
					{widgets}
				</GridLayout>
			</Hidden>

			<Hidden only={['xs', 'md', 'lg', 'xl']}>
				<Alert severity="info" style={{ margin: 10, width: 500 }}>
					<b>The mobile mode is enabled.</b> The layout of your dashboard is optimized for mobile, and widgets cannot be moved nor resized.
				</Alert>
				<GridLayout cols={1} rowHeight={125} width={520} isDraggable={false} isResizable={false} style={{ width: 520 }}>
					{widgetsForTablet}
				</GridLayout>
			</Hidden>

			<Hidden only={['sm', 'md', 'lg', 'xl']}>
				<Alert severity="info" className={css.mobileAlert} >
					<b>The mobile mode is enabled.</b> The layout of your dashboard is optimized for mobile, and widgets cannot be moved nor resized.
				</Alert>
				<GridLayout cols={1} rowHeight={125} width={280} isDraggable={false} isResizable={false} style={{ width: 280 }}>
					{widgetsForMobile}
				</GridLayout>
			</Hidden>

		</Layout>
  );
}

const useStyles = makeStyles(theme => ({
	widget: {
		// background: dynamicGradient,
		boxShadow: theme.common.WIDGET_BOX_SHADOW,
		display: 'flex',
		flexDirection: 'column',
		zIndex: 10,
		borderRadius: 3,
		border: '1px solid #6e778a47'
	},
	addWidget: {
		border: 'rgba(0, 0, 0, 0.2) 2px dashed',
		background: 'rgba(0, 0, 0, 0.05)',
		display: 'flex',
		padding: 20,
		flexDirection: 'column',
		alignItems: 'stretch',
    justifyContent: 'center'
	},
	addIconContainer: {
		textAlign: 'center'
	},
	addTextContainer: {
		textAlign: 'center'
	},
	addIcon: {
		color: 'rgba(0, 0, 0, 0.2)',
		fontSize: theme.fonts.SIZE[32],
		marginBottom: 5,
	},
	svcButton: {
		marginBottom: 5
	},
	mobileAlert: {
		margin: '90px 10px 10px 10px', 
		width: 260, 
		fontSize: theme.fonts.SIZE[14],
		b: {
			fontSize: theme.fonts.SIZE[14]
		}
	}
}));

Dashboard.propTypes = {
  dashId: PropTypes.string
};

export default withAuth(Dashboard);