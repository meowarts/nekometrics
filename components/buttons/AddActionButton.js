import { useState } from 'react';

import AddIcon from '@material-ui/icons/Add';
import WidgetsIcon from '@material-ui/icons/Widgets';
import UsbIcon from '@material-ui/icons/Usb';
import { Popover, List } from '@material-ui/core';
  
import useGlobalState from '~/libs/context';
import { BurgerMenuItem } from './BurgerMenuItem';
import NekoButton from './NekoButton';

const AddActionButton = function () {
  const { toggleModal } = useGlobalState();

  const [ anchorAddWidgetEl, setAnchorAddWidgetEl ] = useState(null);
  const showAddWidget = Boolean(anchorAddWidgetEl);

  const onOpenPopoverClick = ev => { setAnchorAddWidgetEl(ev.currentTarget)};
  const onPopoverClose = () => { setAnchorAddWidgetEl(null) };
  
  const onAddWidgetClick = ev => { 
    setAnchorAddWidgetEl(ev.currentTarget); 
    toggleModal('addwidget');
    onPopoverClose()
  };
  
  const onAddServiceClick = ev => {
    setAnchorAddWidgetEl(ev.currentTarget); 
    toggleModal('datasources');
    onPopoverClose()
  };
  
  return (
    <>
      <NekoButton secondary onClick={onOpenPopoverClick}>
        <AddIcon />Add
      </NekoButton>
      <Popover id='dashboard-select-popover' style={{ marginTop: 10 }}
        open={showAddWidget} anchorEl={anchorAddWidgetEl} onClose={onPopoverClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <List dense={false} style={{  }}>
          <BurgerMenuItem label="Widget" icon={<WidgetsIcon />} onClick={onAddWidgetClick} />
          <BurgerMenuItem label="Data Source" icon={<UsbIcon />} onClick={onAddServiceClick} />    
        </List>
      </Popover>
    </>
  );
}

export default AddActionButton;