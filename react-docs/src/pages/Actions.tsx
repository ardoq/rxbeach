import React from 'react';
import CodePreview from './CodePreview';
import { MainHeading } from './atoms';

const Introduction = () => {
  return (
    <div>
      <MainHeading>Actions</MainHeading>
      <p>
        <strong>Actions</strong> are payloads of information that describe data
        {` that's`} being sent between views and services within an RxBeach
        application. Actions allow us to tie our application together, while
        keeping views and services loosely coupled.
      </p>
      <p>
        {`Here's`} an example of an action, which represents the act of
        selecting an app module:
      </p>
      <CodePreview
        onlySyntaxHighlighting={true}
        code={`
        {
          type: "SHOW_APP_MODULE",
          payload: {
            selectedModule: "dashboard"
          },
          meta: {}
        }`}
      />
      <p>
        In RxBeach, actions are created using <strong>action creators</strong>,
        which construct action payloads with strict typing:
      </p>

      <CodePreview
        code={`
        import { actionCreator } from 'rxbeach';

        type PayloadShowAppModule = {
          selectedModule: 'dashboard' | 'admin';
        };

        const showAppModule = actionCreator<PayloadShowAppModule>(
          'SHOW_APP_MODULE'
        );`}
        onlySyntaxHighlighting={true}
      />

      <p>
        To use actions in our application, we must define an action stream (
        <strong>action$</strong>) that will emit our actions and expose an
        interface that allows us to dispatch new actions (
        <strong>dispatchAction</strong>).
      </p>

      <CodePreview
        code={`
        import { Subject } from 'rxjs';
        import { tag } from 'rxjs-spy/operators';
        import { UnknownAction, markName } from 'rxbeach/internal';
        import { ActionStream } from 'rxbeach';
        
        const createActionStream = () => new Subject<UnknownAction>();
        const actionSubject$ = createActionStream();
        
        export const action$: ActionStream = actionSubject$.pipe(
          // Tag the observable to debug it using rxjs-spy
          tag('action$'),
          // Mark the observable to detect glitches using RxBeach tooling
          markName('action$')
        );
        
        export const dispatchAction = (action: UnknownAction) => actionSubject$.next(action);
        `}
        onlySyntaxHighlighting={true}
      />

      <p>
        Using these constructs, we can dispatch an action in our application and
        react to it by subscribing to the <strong>action$</strong>.
      </p>

      <CodePreview
        code={`
          import { ofType, extractPayload } from 'rxbeach/operators';
          import { action$, dispatchAction } from 'action$';

          // Subscription that reacts to dispatched actions
          // RxBeach ensures that the typing of the payload is inferred from 'showAppModule'
          action$.pipe(
            ofType(showAppModule),
            extractPayload()
          ).subscribe(
            ({ selectedModule }) => 
              console.log(\`Switched app module to \${selectedModule}\`)
            )
          );

          // Action dispatcher
          // RxBeach ensures that the payload matches the type we defined in our actionCreator
          dispatchAction(
            showAppModule({
              selectedModule: 'dashboard'
            })
          )
        `}
        onlySyntaxHighlighting={true}
      />
    </div>
  );
};
const Guidelines = () => {
  return (
    <div>
      <MainHeading>
        Guidelines For Defining Action Creators & Payloads
      </MainHeading>
      <ol>
        <li>
          <h4>Avoid Setters - actions should describe what's happening</h4>
          <p>
            We recommend trying to treat actions more as "describing events that
            occurred", rather than "setters". Treating actions as "events"
            generally leads to more meaningful action names, fewer total actions
            being dispatched, and a more meaningful action log history. Writing
            "setters" often results in too many individual action types, too
            many dispatches, and an action log that is less meaningful.
          </p>
          <p>
            Furthermore, "describing events that occurred" can prevent coupling
            between modules. A module should know how to describe an event that
            happens through an action, but it shouldn't care about how that
            action is executed (i.e. a certain order of action setters).
          </p>
        </li>
        <li>
          <h4>Payloads should be serializable</h4>
          <p>
            Payloads should not contain methods, instances of classes or views.
            You should always aim to pass the data that's required to describe
            the action and nothing more.
          </p>
          <p>
            <strong>What about callbacks?</strong> If you need to describe what
            should happen after an action, describe it with data. This ensures
            less coupling between different modules. The caller only cares about
            describing what should happen, while the handler of the action will
            care about how it should happen.
          </p>
        </li>
        <li>
          <h4>
            Payloads should be concise, avoid passing unnecessary information
          </h4>
          <p>
            Actions should describe what's happening by passing as little
            information as possible. This is in order to ensure that handlers of
            the actions are reading data from the correct source of truth.
          </p>
          <p>
            In practice, this means that you should always to aim pass ids
            instead of whole objects in action payloads. If an action handler
            needs the whole object, it should read that from the single source
            of truth (i.e. from the application state).
          </p>
        </li>
        <li>
          <h4>Batch actions</h4>
          <p>...</p>
        </li>
      </ol>
    </div>
  );
};

const CallbackActions = () => {
  return (
    <div>
      <MainHeading>Pattern - Callback Actions</MainHeading>
      <h3>"Callbacks" as nested action payloads</h3>

      <CodePreview
        code={`
        import { actionCreator } from 'rxbeach';

        type PayloadLoadPostWizardEntities = {
          successAction?: UnknownAction;
        };
        const loadPostWizardEntities = actionCreator<PayloadLoadPostWizardEntities>(
          'LOAD_POST_WIZARD_ENTITIES'
        );
        
        // Load post wizard entities, keep wizard open
        dispatchAction(loadPostWizardEntities());
        
        // Load post wizard entities and hide wizard, hideIntroductionWizard is an action creator
        dispatchAction(loadPostWizardEntities({ onSuccessAction: hideIntroductionWizard() }));
        `}
        onlySyntaxHighlighting={true}
      />

      <h3>"Callbacks" as enums that describe what should happen</h3>

      <CodePreview
        code={`
        import { actionCreator } from 'rxbeach';

        enum ExitWizardTarget {
          LoadEntities = 'load-entities',
          ShowIntroduction = 'show-introduction',
        }
        
        type PayloadTriggerExitPrompt = {
          target: ExitWizardTarget;
        };
        
        const triggerExitPrompt = actionCreator<PayloadTriggerExitPrompt>(
          'TRIGGER_EXIT_PROMPT'
        );
        
        // Show exit wizard confirmation, upon confirmation load entities
        dispatchAction(triggerExitPrompt({ target: ExitWizardTarget.LoadEntities }));
        
        // Show exit wizard confirmation, upon confirmation show introduction
        dispatchAction(triggerExitPrompt({ target: ExitWizardTarget.ShowIntroduction }));
        `}
        onlySyntaxHighlighting={true}
      />
    </div>
  );
};

export default {
  title: 'Actions',
  id: 'actions',
  pages: [
    {
      id: 'actions-intro',
      title: 'Introduction',
      component: Introduction,
    },
    {
      id: 'actions-guidelines',
      title: 'Guidelines',
      component: Guidelines,
    },
    {
      id: 'actions-callbacks',
      title: 'Pattern - Callback Actions',
      component: CallbackActions,
    },
  ],
};
