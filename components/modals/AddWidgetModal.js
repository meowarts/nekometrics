import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';
import { Dialog } from "@material-ui/core";

import { WidgetsRepository } from '~/components/widgets/WidgetsRepository';
import useGlobalState from '~/libs/context';
import { ServicesRepository } from '../services/ServicesRepository';
import NekoButton from '~/components/buttons/NekoButton';
import { NekoDialogActionWrapper, NekoDialogContentWrapper, NekoBigWidgetButtons } from '~/components/elements/NekoElements';

function AddWidgetModal() {
  const css = useStyles();
  const { services, addWidget, toggleModal, modals } = useGlobalState(); 

  const onDataSourceClick = () => { 
    toggleModal('adddatasource');
    toggleModal('addwidget', false);
  };

  const onAddWidget = (widgetSpine) => {
    addWidget(widgetSpine.service, widgetSpine.type);
    toggleModal('addwidget');
  }

  let availableServices = services.map(x => x.service);
  // TODO: Maybe we should only have this in PRD and Testing
  availableServices.push('fake');

  return (
    <>

    <Dialog open={modals.addwidget} className={css.dialog} onClose={() => toggleModal('addwidget')}>
      <CloseIcon style={{ position: 'absolute', right: 20, top: 15, cursor: 'pointer'}} 
        onClick={() => toggleModal('addwidget')}/>
      <h5>ADD WIDGET</h5>
      <NekoDialogContentWrapper>
        <p className={css.description}>
          Here is the list of the widgets available to you. For more widgets, click the 
          <b> + Add Data Source</b> button below.
        </p>

        <div className={css.addContainer}>

          {availableServices.map((service, key) => {
            const Service = ServicesRepository.find(x => x.name === service);
            if (!Service) {
              console.error("Could not find the service in the repository.", service);
            }

            // List the available widgets for each service (datasource) set up by the user
            return (
              <div key={`service-${Service.name}-${key}`}>
                <p style={{color: Service.color}} className={css.widgetTitle}><Service.icon style={{color: Service.color}}/>{Service.title}</p>
                <div className={css.widgetSelectionContainer}>
                {WidgetsRepository.filter(x => x.service === service).map(x =>
                  <NekoBigWidgetButtons key={`add-widget-${x.service}-${x.type}`}
                    onClick={() => onAddWidget(x)}>
                      <div className='buttonContent' style={{ color: '#8c8c8c' }}>
                        <x.subIcon/>
                        {x.title}
                        <small style={{ fontWeight: 300}}>{x.description}</small>
                      </div>
                  </NekoBigWidgetButtons>
                )}
                </div>
              </div>
            );

          })}
        </div>
      </NekoDialogContentWrapper>
      
      <NekoDialogActionWrapper>
        <NekoButton onClick={onDataSourceClick} tertiary style={{width: '100%'}}> <AddIcon/> Add Data Source</NekoButton>
      </NekoDialogActionWrapper>      
    </Dialog>
    </>
  );
}

const useStyles = makeStyles(theme => ({
    addContainer: {
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center'
    }, 
    widgetTitle: {
      margin: '0px 0 5px',
      fontWeight: theme.fonts.WEIGHT[500],
      fontSize: theme.fonts.SIZE[14],
      '& .MuiSvgIcon-root': {
        width: 20,
        height: 25,
        position: 'relative',
        top: 7,
        marginRight: 5
      }
    },
    description: {
      fontWeight: theme.fonts.WEIGHT[300],
      margin: '0px 100px 10px 0px'
    },
    widgetSelectionContainer: {
      display: 'flex', 
      flexWrap: 'wrap',
      gap: '10px'
    }
}));

export default AddWidgetModal;
