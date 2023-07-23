import { useState } from 'react';
import { Dialog, Select, MenuItem } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';

import NekoButton from '~/components/buttons/NekoButton';
import { NekoDialogActionWrapper, NekoDialogContentWrapper } from '~/components/elements/NekoElements';

import useGlobalState from '~/libs/context';

function MoveWidgetModal(props) {
  const { widgetId, onClose } = props;
  const { moveWidget, dashboards, dashboard } = useGlobalState();
  const [ dashboardId, setDashboardId ] = useState(dashboard?._id);

  const onMoveClick = async () => {
    await moveWidget(widgetId, dashboardId);
    onClose();
  }

  return (
    <Dialog {...props}>
      <CloseIcon style={{ position: 'absolute', right: 20, top: 15, cursor: 'pointer'}} onClick={() => onClose()}/>
      <h5>MOVE WIDGET</h5>
      <NekoDialogContentWrapper>
          <Select value={dashboardId} onChange={(ev) => setDashboardId(ev.target.value)} style={{ width: '100%' }}>
            {dashboards.map(x => <MenuItem key={x._id} value={x._id}>{x.name}</MenuItem>)}
          </Select>
      </NekoDialogContentWrapper>
      <NekoDialogActionWrapper>
        <NekoButton tertiary onClick={() => onMoveClick()} disabled={dashboardId === dashboard?._id}>
          Move
        </NekoButton>
      </NekoDialogActionWrapper>

    </Dialog>
  );
}

export default MoveWidgetModal;
