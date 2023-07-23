import { useCallback, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Footer from '~/components/Footer';
import Layout from '~/components/Layout';
import GridLayout from 'react-grid-layout';
import { useTheme } from '@material-ui/core';
import WidgetsFactory from '~/components/widgets/WidgetsFactory';
import NekoButton from '~/components/buttons/NekoButton';
import { NekoColors } from '~/theme';
import { obtainPosition } from '~/libs/helpers';
import withAuth from '~/libs/withAuth';

let counter = 0;

const defaultWidgets = [
	{
		_id: counter++,
		name: "Instagram Followers",
		service: "fake",
		type: "historical",
		h: 2,
		w: 2,
		x: 0,
		y: 0,
		role: 'read',
		settings: { 
			color: NekoColors.YELLOW,
			period: { unit: "week", length: 2}, 
			dataType: "cumulative", 
			chart: { type: "bar" }
		}
	}, {
		_id: counter++,
		name: "Page Likes",
		service: "fake",
		type: "historical",
		h: 2,
		w: 2,
		x: 2,
		y: 0,
		role: 'read',
		settings: {
			color: NekoColors.GREEN,
			period: { unit: "week", length: 2 }, 
			dataType: "cumulative", 
			chart: { type: "bar" }
		}
	}, {
		_id: counter++,
		name: "Twitter Followers",
		service: "fake",
		type: "historical",
		h: 2,
		w: 4,
		x: 4,
		y: 0,
		role: 'read',
		settings: { 
			color: NekoColors.RED,
			period: { unit: "month", length: 6 },
			dataType: "cumulative",
			chart: { type: "area" }
		}
	}, {
		_id: counter++,
		name: "Site Visitors",
		service: "fake",
		type: "historical",
		h: 2,
		w: 3,
		x: 0,
		y: 2,
		role: 'read',
		settings: { 
			color: NekoColors.BLUE,
			period: { unit: "month", length: 4 },
			dataType: "default",
			chart: { type: "area" }
		}
	}
];

const widgetAttributes = ['name', 'w', 'h', 'service', 'type', 'role', 'settings']

const randomRepository = [
	['Blog FB Likes', 'My Dog Twitter Fans', 'YouTube Subscribers', 'Daddy\'s FB Likes', 'My Cat Twitter Followers', 
		'My Boss FB Fans', 'Blog Visits', 'Books Sold Recently', 'Licenses Sold', 'Recipes Subscribers', 
		'Bookstore Subscribers'],
	[2, 2, 3, 3, 3, 3],
	[2, 2, 2, 2, 2, 2],
	['fake'],
	['historical'],
	['read'],
	[{ color: NekoColors.PINK, period: { unit: "day", length: 6 }, dataType: "default", chart: { type: "area" } },
	{ color: NekoColors.BLUE, period: { unit: "month", length: 2 }, dataType: "default", chart: { type: "bar" } },
	{ color: NekoColors.ORANGE, period: { unit: "day", length: 42 }, dataType: "cumulative", chart: { type: "line" } },
	{ color: NekoColors.YELLOW, period: { unit: "month", length: 2 }, dataType: "default", chart: { type: "bar" } },
	{ color: NekoColors.TEAL, period: { unit: "year", length: 2 }, dataType: "cumulative", chart: { type: "area" } },
	{ color: NekoColors.GREEN, period: { unit: "day", length: 24 }, dataType: "cumulative", chart: { type: "bar" } },
	{ color: NekoColors.PURPLE, period: { unit: "day", length: 4 }, dataType: "cumulative", chart: { type: "area" } },
	]
]

const Demo = () => {
	const css = useStyles();
	const theme = useTheme();
	const [widgets, setWidgets] = useState(defaultWidgets);

	const onRandomizeWidgets = useCallback(() => {
		let newWidgets = []; 
		let widgetCount = Math.floor(Math.random() * 5) + 2;

		while (widgetCount-- > 0) {
			let newWidget = {};
			for (let i = 0; i < widgetAttributes.length; i++) {
				newWidget[widgetAttributes[i]] = randomRepository[i][Math.floor(Math.random() * randomRepository[i].length)];
			}
			if (newWidget.h > 1 && newWidget.w == 1) {
				newWidget.h = 1;
			}
			const { x, y, w, h } = obtainPosition(newWidgets, newWidget.w, newWidget.h);
			newWidget._id = Math.random();
			newWidget.x = x;
			newWidget.y = y;
			newWidget.w = w;
			newWidget.h = h;
			newWidgets = [...newWidgets, newWidget];
		}
		setWidgets(newWidgets)
	});

	const onLayoutChange = async (newLayout) => {
		let freshWidgets = [];
		for (let item of newLayout) {
			const { i, h, w, x, y } = item;
			const widget = widgets.find(x => x._id.toString() === i.toString());
			freshWidgets.push({ ...widget, h, w, x, y });
		}
		setWidgets(freshWidgets);
	}

	const widgetsJSX = useMemo(() => {
		return widgets.map(widget => 
			<div key={widget._id} className={css.widget} 
				data-grid={{x: widget.x, y: widget.y, w: widget.w, h: widget.h}}
				style={{  background: theme.common.WIDGET_BACKGROUND_SOLID }}>
				<WidgetsFactory widget={widget} updateSpeed='fast' />
			</div>
		)
	}, [css, widgets]);

	return (
		<Layout usePaper={false}>
			<h1 className={css.pageTitle}><span className={css.gradient}>Demo</span></h1>
			<div style={{ display: 'flex', justifyContent: 'center', marginTop: 40, marginBottom: 40 }}>
				<NekoButton primary onClick={() => onRandomizeWidgets()}>Randomize Widgets</NekoButton>
			</div>
			<p style={{ fontSize: 18, marginBottom: 30 }}>This is a totally <b>random</b> and <b>illogical</b> dashboard 😌 It is only for you to play and get an idea of what you an build. <span style={{ fontSize: 14 }}>Please try to move those widgets around, and resize them. In this demo, you cannot change their titles, colors or anything, and the data behaves a bit crazy. For more fun, start a free trial - with your own data, it will be much more exciting! 💕</span></p>

			<GridLayout cols={8} rowHeight={125} width={1040} isDraggable={true} onLayoutChange={onLayoutChange}
				isResizable={true} style={{ width: 1040, marginBottom: 80 }}>
				{widgetsJSX}
			</GridLayout>

			<Footer/>
		</Layout>
	);
}

const useStyles = makeStyles(theme => ({
	pageTitle: {
		textAlign: 'center',
		margin: '60px 0'
	},
	gradient: theme.gradient,
	faqWrapper: {
		marginBottom: '80px'
	},
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

export default withAuth(Demo);