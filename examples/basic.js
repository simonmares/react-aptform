// @flow

import * as React from 'react';

// project
import { Aptform, preconfigure } from '../src/index';

// examples
import { yesNo, PrettyPrintObject, DebugStateInput } from './helper-ui';
import { isEmailNaive as isEmail } from './helper-validators';

export const BasicExample = ({ action }: *) => (
  <div>
    <Aptform
      config={{
        typeTimeout: 500,
        resetOnSubmit: true,
      }}
      inputs={{
        name: { required: false },
        password: { required: true },
        email: { required: false },
        phone: { required: false },
      }}
      onSubmit={action('onSubmit')}
      render={({ inputs, form }) => {
        const { name, password, email, phone } = inputs;
        return (
          <form onBlur={form.onBlur} onFocus={form.onFocus}>
            <strong>form</strong>
            <div>hasChanged(): {yesNo(form.hasChanged())}</div>
            <div>isValid(): {yesNo(form.isValid())}</div>
            <hr />
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

export const WithLotInputs = ({ action }: *) => {
  const generateInputs = (amount) => {
    const inputs = {};
    // eslint-disable-next-line
    for (let i = 0; i < amount; i++) {
      inputs[`field${i}`] = { required: false };
    }
    return inputs;
  };
  return (
    <div>
      <Aptform
        config={{
          typeTimeout: 500,
        }}
        onSubmit={action('onSubmit')}
        inputs={generateInputs(100)}
        render={({ inputs, form }) => {
          const renderInput = (input) => (
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

export const AllInputTypes = ({ action }: *) => (
  <Aptform
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

export const ConfigureForms = ({ action }: *) => {
  const config = { failFast: true, typeTimeout: 1000, msgInvalid: 'Not valid (ConfigureForm)!' };
  const AptformConfigured = preconfigure(config);

  const render = () => {
    return (
      <div>
        <h1>Configured</h1>

        <article>
          <section>
            <div>
              <strong>preconfigured with:</strong>
              <PrettyPrintObject value={config} />
            </div>
            <strong>Form#1</strong>
            <ul>
              <li>config.msgInvalid='Make it better!' => should override default error text</li>
              <li>config.typeTimeout=250 => showError() should return true quickly</li>
            </ul>
            <AptformConfigured
              onSubmit={action('onSubmit')}
              initialValues={{ email: '' }}
              inputs={{
                email: {
                  validations: { isEmail },
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
          </section>
        </article>
        <strong>Form#2</strong>
        <ul>
          <li>config.failFast=False => should show all errors</li>
          <li>config.msgInvalid='Should not happen.' => should be ignored</li>
        </ul>
        <AptformConfigured
          config={{ failFast: false, msgInvalid: 'Should not happen.' }}
          onSubmit={action('onSubmit')}
          initialValues={{ email: '' }}
          inputs={{
            email: {
              validations: { includes100: (v) => v.includes('100'), isEmail },
              validationOrder: ['isEmail', 'includes100'],
              errorTextMap: {
                includes100: 'does not include 100',
                isEmail: (i) => (i.value.includes('@') ? 'invalid email' : '@ char is missing'),
              },
            },
          }}
          render={({ inputs, form }) => {
            const { email } = inputs;
            return (
              <form {...form.getPassProps()}>
                <DebugStateInput type="email" {...email.getPassProps()} inputState={email} />
              </form>
            );
          }}
        />
        <strong>Form#3</strong>
        <ul>
          <li>no config => should show msgInvalid from ConfigureForms prop</li>
        </ul>
        <AptformConfigured
          onSubmit={action('onSubmit')}
          initialValues={{ email: '' }}
          inputs={{ email: { validations: { isEmail } } }}
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

// NoteReview(simon): add example how to allow dynamic inputs without extra prop etc.
// export const WithDynamicInputs = ({ action }: *) => () => {
//   class DynamicInputs extends React.Component<any, *> {
//     onFormRender: *;

//     constructor(props) {
//       super(props);
//       this.onFormRender = this.onFormRender.bind(this);

//       this.state = { otherSexActive: true };
//     }

//     onFormRender({ inputs, form }) {
//       const { name, age, sex, sexOpen } = inputs;
//       console.log('inputs', inputs);
//       return (
//         <form onBlur={form.onBlur} onFocus={form.onFocus} onSubmit={form.onSubmit}>
//           <div>
//             Name: <input type="text" {...name.getPassProps()} />
//           </div>
//           <div>
//             Age: <input type="number" {...age.getPassProps()} />
//           </div>
//           <div>
//             <select {...sex.getPassProps()}>
//               <option value="man">Man</option>
//               <option value="woman">Woman</option>
//               <option value="other">Other</option>
//             </select>
//           </div>
//           {sexOpen && (
//             <div>
//               Other sex: <input type="text" {...sexOpen.getPassProps()} />
//             </div>
//           )}
//         </form>
//       );
//     }

//     render() {
//       const { otherSexActive } = this.state;

//       return (
//         <Aptform
//           initialValues={{
//             name: 'John Villa',
//             age: 35,
//             sex: 'other',
//           }}
//           onChange={(name, value) => {
//             if (name === 'sex') {
//               if (value === 'other') {
//                 this.setState({ otherSexActive: true });
//               } else {
//                 this.setState({ otherSexActive: false });
//               }
//             }
//           }}
//           inputsDynamic
//           onSubmit={action('onSubmit')}
//           inputs={{
//             name: {},
//             age: {},
//             sex: {},
//             sexOpen: otherSexActive ? {} : null,
//           }}
//           render={this.onFormRender}
//         />
//       );
//     }
//   }

//   return <DynamicInputs />;
// };

export const GistDocsExample = ({ action }: *) => (
  <Aptform
    initialValues={{
      name: 'Eliana Rendón',
      email: 'eliana@example.com',
    }}
    onSubmit={(values) => {
      console.log('Name value: ', values.name);
      console.log('Email value: ', values.email);
    }}
    inputs={{
      name: { required: true },
      email: { validations: { isEmail: (val) => /@/.test(val) } },
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

export default {
  'basic with debug': BasicExample,
  '100 inputs': WithLotInputs,
  'pre-configuration': ConfigureForms,
  'gist docs example': GistDocsExample,
  'all inputs types': AllInputTypes,
};
