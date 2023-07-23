import { makeStyles } from '@material-ui/core/styles';

import Layout from '~/components/Layout';
import Contact from '~/components/elements/Contact';
import withAuth from '~/libs/withAuth';

const Tutorial = () => {
  const css = useStyles();

  const TutorialStep = ({ title, explanation, image }) =>
    <div className={css.tutorialStep}>
      <h2 className={css.title}>{title}</h2>
      <p className={css.explanation}>{explanation}</p>
      <img src={image} />
    </div>


  return (
    <>
      <Layout usePaper={true}>
        <h1 className={css.pageTitle}><span className={css.gradient}>Tutorial</span></h1>
        <div className={css.tutorialWrapper}>
          <TutorialStep
            title="Step 1: Connect Your Services"
            explanation="Lorem ipsum dolor sit amet, consectetur adipiscing elit. A, duis porta molestie diam non ante suspendisse egestas nec. Leo tempus porta gravida amet mauris morbi amet."
            image="./"
          />
          <TutorialStep
            title="Step 2: Add A Widget"
            explanation="Lorem ipsum dolor sit amet, consectetur adipiscing elit. A, duis porta molestie diam non ante suspendisse egestas nec. Leo tempus porta gravida amet mauris morbi amet."
            image="./"
          />
          <TutorialStep
            title="Step 3: Make It Your Own"
            explanation="Lorem ipsum dolor sit amet, consectetur adipiscing elit. A, duis porta molestie diam non ante suspendisse egestas nec. Leo tempus porta gravida amet mauris morbi amet."
            image="./"
          />
        </div>
        <Contact message="Still confused by how to use Nekometrics?" />
      </Layout>
    </>
  );
}

const useStyles = makeStyles(theme => ({
  pageTitle: {
    textAlign: 'center',
    margin: '60px 0'
  },
  gradient: theme.gradient,
  tutorialWrapper: {
    marginBottom: '80px'
  },
  tutorialStep: {
    margin: '40px 130px'
  },
  title: {
    margin: 0
  },
  explanation: {
    margin: '15px 0',
    fontSize: theme.fonts.SIZE[16]
  }
}));

export default withAuth(Tutorial);