// @flow

import * as React from 'react';

// project
import { FormStore, FormValues, preconfigure } from '../src/index';

// examples
import { yesNo, PrettyPrintObject, TestCase, DebugStateInput } from './helper-ui';
import { isEmailNaive } from './helper-utils';

const BasicExample = ({ action }: *) => () => (
  <div>
    <FormValues
      config={{
        typeTimeout: 500,
      }}
      initialValues={{
        name: 'Timo',
      }}
      inputs={{
        name: {},
        password: {
          required: true,
        },
        email: {},
        phone: {},
      }}
      onSubmit={action('onSubmit')}
      render={({ inputs, form }) => {
        const { name, password, email, phone } = inputs;
        return (
          <form onBlur={form.onBlur} onFocus={form.onFocus}>
            <div>hasChanged(): {yesNo(form.hasChanged())}</div>
            <div>isValid(): {yesNo(form.isValid())}</div>
            <DebugStateInput
              type="text"
              name={name.name}
              value={name.value}
              onChange={name.onChange}
              inputState={name}
            />
            <DebugStateInput
              type="text"
              name={password.name}
              value={password.value}
              onChange={password.onChange}
              required={password.required}
              inputState={password}
            />
            <DebugStateInput
              type="text"
              name={email.name}
              value={email.value}
              onChange={email.onChange}
              inputState={email}
            />
            <DebugStateInput type="text" inputState={phone} {...phone.getPassProps()} />
            <button onClick={form.onSubmit}>Submit</button>
          </form>
        );
      }}
    />
  </div>
);

const WithValidations = ({ action }: *) => () => (
  <div>
    <FormValues
      config={{
        typeTimeout: 500,
      }}
      initialValues={{ emailInitial: 'not@valid' }}
      inputs={{
        emailInitial: { validations: { isEmail: isEmailNaive } },
        email: {
          validations: { isEmail: isEmailNaive },
          required: true,
        },
        password: {
          required: true,
          validations: {
            minLength: value => value.length > 5,
          },
        },
        name: {
          required: true,
        },
      }}
      onSubmit={action('onSubmit')}
      render={({ inputs, form }) => {
        const { password, email, name, emailInitial } = inputs;
        return (
          <form onBlur={form.onBlur} onFocus={form.onFocus}>
            <div>hasChanged(): {yesNo(form.hasChanged())}</div>
            <div>isValid(): {yesNo(form.isValid())}</div>

            <DebugStateInput type="text" inputState={password} {...password.getPassProps()} />
            <DebugStateInput type="text" inputState={email} {...email.getPassProps()} />
            <DebugStateInput type="text" inputState={name} {...name.getPassProps()} />
            <TestCase
              title="Email with initial value"
              desc="Should display error without any change."
            >
              <DebugStateInput
                type="text"
                inputState={emailInitial}
                {...emailInitial.getPassProps()}
              />
            </TestCase>
            <button onClick={form.onSubmit}>Submit</button>
          </form>
        );
      }}
    />
  </div>
);

const WithLotInputs = ({ action }: *) => () => {
  const generateALOTInputs = () => {
    const inputs = {};
    // eslint-disable-next-line
    for (let i = 0; i < 150; i++) {
      inputs[`field${i}`] = {};
    }
    return inputs;
  };
  return (
    <div>
      <FormValues
        config={{
          typeTimeout: 500,
        }}
        onSubmit={action('onSubmit')}
        inputs={generateALOTInputs()}
        render={({ inputs, form }) => {
          const renderInput = input => (
            <DebugStateInput
              key={input.name}
              type="text"
              inputState={input}
              {...input.getPassProps()}
            />
          );

          const allInputs = () => {
            const inputList = [];
            for (const key of Object.keys(inputs)) {
              inputList.push(inputs[key]);
            }

            return inputList.map(renderInput);
          };

          return (
            <form onBlur={form.onBlur} onFocus={form.onFocus}>
              {allInputs()}
              <button onClick={form.onSubmit}>Submit</button>
            </form>
          );
        }}
      />
    </div>
  );
};

const WithSyncToStore = ({ action }: *) => () => {
  const render = ({ getAllForms, getForm }) => {
    const loginFormId = 'loginForm';
    const signupFormId = 'signupForm';

    const collectForms = () => {
      const allForms = getAllForms();
      action('allForms')(allForms);

      const loginForm = getForm(loginFormId);
      const signupForm = getForm(signupFormId);
      action('loginForm')(loginForm);
      action('signupForm')(signupForm);
    };

    const CustomInput = ({ formId, ...passProps }) => {
      const id = `${formId}${passProps.name}`;
      return (
        <div>
          <label htmlFor={id}>{passProps.name}</label>: <input id={id} {...passProps} />
        </div>
      );
    };

    return (
      <div>
        <strong>{signupFormId}</strong>
        <FormValues
          syncToStore
          id={signupFormId}
          onSubmit={action('onSubmit')}
          inputs={{
            email: {},
            name: {},
          }}
          render={({ inputs, form }) => {
            const { name, email } = inputs;
            return (
              <form {...form.getPassProps()}>
                <CustomInput formId={signupFormId} type="text" {...name.getPassProps()} />
                <CustomInput formId={signupFormId} type="text" {...email.getPassProps()} />
              </form>
            );
          }}
        />
        <strong>{loginFormId}</strong>
        <FormValues
          syncToStore
          id={loginFormId}
          onSubmit={action('onSubmit')}
          inputs={{
            password: {},
          }}
          render={({ inputs, form }) => {
            const { password } = inputs;
            return (
              <form {...form.getPassProps()}>
                <CustomInput formId={loginFormId} type="password" {...password.getPassProps()} />
              </form>
            );
          }}
        />
        <button onClick={collectForms}>Collect forms</button>
      </div>
    );
  };
  return <FormStore render={render} />;
};

const WithAllInputTypes = ({ action }: *) => () => (
  <FormValues
    config={{
      typeTimeout: 500,
    }}
    initialValues={{
      name: 'John Villa',
      age: 35,
      sex: 'other',
      over18: '',
      status: '',
    }}
    onSubmit={action('onSubmit')}
    inputs={{
      name: {},
      age: {},
      sex: {},
      over18: {},
      status: {},
    }}
    render={({ inputs, form }) => {
      const { name, age, sex, over18, status } = inputs;
      return (
        <form onBlur={form.onBlur} onFocus={form.onFocus} onSubmit={form.onSubmit}>
          <div>
            Name: <input type="text" {...name.getPassProps()} />
          </div>
          <div>
            Age: <input type="number" {...age.getPassProps()} />
          </div>
          Man:
          <input
            type="radio"
            name="sex"
            onChange={sex.onChange}
            checked={sex.value === 'man'}
            value="man"
          />
          Woman:
          <input
            type="radio"
            name="sex"
            onChange={sex.onChange}
            checked={sex.value === 'woman'}
            value="woman"
          />
          Other:
          <input
            type="radio"
            name="sex"
            onChange={sex.onChange}
            checked={sex.value === 'other'}
            value="other"
          />
          <div>
            I am over 18:
            <input
              type="checkbox"
              name="over18"
              checked={over18.value}
              onChange={over18.onChange}
            />
          </div>
          <select name="status" value={status.value} onChange={status.onChange}>
            <option value="unmarried">Unmarried</option>
            <option value="married">Married</option>
          </select>
          <br />
          <button onClick={form.onSubmit}>Submit</button>
        </form>
      );
    }}
  />
);

const WithConfigureForms = ({ action }: *) => () => {
  const config = { failFast: true, typeTimeout: 1000, msgInvalid: 'Not valid (ConfigureForm)!' };
  const FormValuesConfigured = preconfigure(config);

  const render = () => {
    return (
      <div>
        <div>
          <strong>preconfigured with:</strong>
          <PrettyPrintObject value={config} />
        </div>
        <strong>Form#1</strong>
        <ul>
          <li>config.msgInvalid='Make it better!' => should override default error text</li>
          <li>config.typeTimeout=250 => showError() should return true quickly</li>
        </ul>
        <FormValuesConfigured
          onSubmit={action('onSubmit')}
          inputs={{
            email: {
              validations: { isEmail: isEmailNaive },
            },
          }}
          config={{ msgInvalid: 'Make it better!', typeTimeout: 250 }}
          render={({ inputs, form }) => {
            const { email } = inputs;
            return (
              <form {...form.getPassProps()}>
                <DebugStateInput type="text" {...email.getPassProps()} inputState={email} />
              </form>
            );
          }}
        />
        <strong>Form#2</strong>
        <ul>
          <li>config.failFast=False => should show all errors</li>
          <li>config.msgInvalid='Should not happen.' => should be ignored</li>
        </ul>
        <FormValuesConfigured
          config={{ failFast: false, msgInvalid: 'Should not happen.' }}
          onSubmit={action('onSubmit')}
          inputs={{
            email: {
              validations: { is100: v => v === 100, isEmail: isEmailNaive },
              getErrorFromMap: i => ({
                'invalid email': i.clientErrors.isEmail,
                'not 100 percent': i.clientErrors.is100,
              }),
            },
          }}
          render={({ inputs, form }) => {
            const { email } = inputs;
            return (
              <form {...form.getPassProps()}>
                <DebugStateInput type="password" {...email.getPassProps()} inputState={email} />
              </form>
            );
          }}
        />
        <strong>Form#3</strong>
        <ul>
          <li>no config => should show msgInvalid from ConfigureForms prop</li>
        </ul>
        <FormValuesConfigured
          onSubmit={action('onSubmit')}
          inputs={{ email: { validations: { isEmail: isEmailNaive } } }}
          render={({ inputs, form }) => {
            const { email } = inputs;
            return (
              <form {...form.getPassProps()}>
                <DebugStateInput type="password" {...email.getPassProps()} inputState={email} />
              </form>
            );
          }}
        />
      </div>
    );
  };

  return <div>{render()}</div>;
};

const WithDynamicInputs = ({ action }: *) => () => {
  class DynamicInputs extends React.Component<any, *> {
    onFormRender: *;

    constructor(props) {
      super(props);
      this.onFormRender = this.onFormRender.bind(this);

      this.state = { otherSexActive: true };
    }

    onFormRender({ inputs, form }) {
      const { name, age, sex, sexOpen } = inputs;
      console.log('inputs', inputs);
      return (
        <form onBlur={form.onBlur} onFocus={form.onFocus} onSubmit={form.onSubmit}>
          <div>
            Name: <input type="text" {...name.getPassProps()} />
          </div>
          <div>
            Age: <input type="number" {...age.getPassProps()} />
          </div>
          <div>
            <select {...sex.getPassProps()}>
              <option value="man">Man</option>
              <option value="woman">Woman</option>
              <option value="other">Other</option>
            </select>
          </div>
          {sexOpen && (
            <div>
              Other sex: <input type="text" {...sexOpen.getPassProps()} />
            </div>
          )}
        </form>
      );
    }

    render() {
      const { otherSexActive } = this.state;

      return (
        <FormValues
          inputsAreDynamic
          initialValues={{
            name: 'John Villa',
            age: 35,
            sex: 'other',
          }}
          onChange={(name, value) => {
            if (name === 'sex') {
              if (value === 'other') {
                this.setState({ otherSexActive: true });
              } else {
                this.setState({ otherSexActive: false });
              }
            }
          }}
          inputsDynamic
          onSubmit={action('onSubmit')}
          inputs={{
            name: {},
            age: {},
            sex: {},
            sexOpen: otherSexActive ? {} : null,
          }}
          render={this.onFormRender}
        />
      );
    }
  }

  return <DynamicInputs />;
};

const GistDocsExample = ({ action }: *) => () => (
  <FormValues
    initialValues={{
      name: 'Eliana Rendón',
      email: 'eliana@example.com',
    }}
    onSubmit={values => {
      console.log('Name value: ', values.name);
      console.log('Email value: ', values.email);
    }}
    inputs={{
      name: { required: true },
      email: { validations: { isEmail: val => /@/.test(val) } },
    }}
    render={({ inputs, form }) => {
      const { name, email } = inputs;
      return (
        <form onBlur={form.onBlur} onFocus={form.onFocus} onSubmit={form.onSubmit}>
          <div>
            Name: <input type="text" value={name.value} name={name.name} onChange={name.onChange} />
          </div>
          <div>
            Email:
            <input type="email" value={email.value} name={email.name} onChange={email.onChange} />
          </div>
          <button type="submit" disabled={!form.isValid()}>
            Submit
          </button>
        </form>
      );
    }}
  />
);

BasicExample.displayName = 'Basic with debug';
WithValidations.displayName = 'With validations';
WithLotInputs.displayName = 'With 100 inputs';
WithSyncToStore.displayName = 'With sync to store';
WithConfigureForms.displayName = 'With ConfigureForms config';
WithDynamicInputs.displayName = 'With dynamic inputs';
GistDocsExample.displayName = 'Gist docs example';
WithAllInputTypes.displayName = 'All supported input types';

export {
  BasicExample,
  WithValidations,
  WithLotInputs,
  WithSyncToStore,
  WithConfigureForms,
  WithDynamicInputs,
  GistDocsExample,
  WithAllInputTypes,
};
