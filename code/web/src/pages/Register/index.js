import React, { Component } from 'react';
import { FieldArray, Field, Form, Formik } from 'formik';
import Dropzone from 'react-dropzone';
import TagField from 'components/TagField';
import InputField from 'components/InputField';
import { connect } from 'react-redux';
import { signup } from 'actions/auth';
import { Redirect } from 'react-router-dom';
import signUpSchema from 'utils/validations/signUpSchema';
import TwitterButton from 'components/TwitterButton';
import Orcid from 'pages/Orcid';
import { orcidPost } from 'utils/api';

class SignUp extends Component {
  state = {
    imageFiles: [],
    orcid: '',
    orcid_access_token: '',
  };

  onDrop = (setFieldValue, imageFiles) => {
    this.setState({
      imageFiles: imageFiles,
    });
    setFieldValue('avatar', this.state.imageFiles[0]);
  };

  getChildContext() {
    return {
      location: this.props.location,
    };
  }

  setUserId = (values, setFieldValue) => {
    setFieldValue('twitter_user_id', values[0]);
    setFieldValue('twitter_oauth_token', values[1]);
    setFieldValue('twitter_oauth_token_secret', values[2]);
  };

  valuesToFormData(values, history, signup) {
    const bodyFormData = new FormData();
    Object.keys(values).map(value => {
      if (value !== 'interests') {
        bodyFormData.append(value, values[value]);
      }
    });

    bodyFormData.append("orcid", this.state.orcid);
    bodyFormData.append("orcid_access_token", this.state.orcid_access_token);

    for (var i = 0; i < values.interests.length; i++) {
      bodyFormData.append('interests[]', values.interests[i]);
    }

    signup(bodyFormData, history);
  }

  componentDidMount() {
    const { search } = this.props.location;
    const params = new URLSearchParams(search);
    const code = params.get('code');

    if (code) {
      orcidPost(code).then(res => {
        console.log(res.data.orcid);
        this.setState({
          orcid: res.data.orcid,
          orcid_access_token: res.data.access_token,
        });
      });
    }
  }

  render() {
    const {
      props: { history, signup, registerError, registered },
      state: { orcid, orcid_access_token },
    } = this;
    console.log(this.state);
    return (
      <div>
        {registered === true ? (
          <Redirect to="/profile" />
        ) : (
          <div className="container">
            <div className="row container-header">
              <div className="col-md-2 margin-left">
                <div className="logo" />
              </div>
            </div>
            <div className="row container-title-profile">
              <div className="col-md-3 margin-left" />
              <div className="col-md-6 content">
                <div className="headline">CREATE YOUR ACCOUNT</div>
                <div className="warning">
                  All fields with a * must be filled.
                </div>
              </div>
              <div className="col-md-3 margin-right" />
            </div>
            <Formik
              onSubmit={values => {
                console.log(values);
                this.valuesToFormData(values, history, signup);
              }}
              validationSchema={signUpSchema}
              initialValues={{
                username: '',
                twitter_user_id: '',
                twitter_oauth_token: '',
                twitter_oauth_token_secret: '',
                email: '',
                interests: '',
                orcid: { orcid },
                orcid_access_token: orcid_access_token,
                name: '',
                research_area: '',
                institution: '',
                description: '',
                avatar: '',
              }}
              render={({ setFieldValue }) => (
                <div>
                  <Form>
                    <div className="row container-profile">
                      <div className="col-md-2 margin-left" />
                      <div className="col-md-4 form-area">
                        <div className="input-area">
                          <Field
                            name="username"
                            type="text"
                            component={InputField}
                            label="Username *"
                            labelClass="input-title"
                            placeholder="Enter your username"
                          />
                          <Field
                            name="email"
                            type="text"
                            component={InputField}
                            label="Email *"
                            labelClass="input-title"
                            placeholder="Enter your e-mail"
                          />
                          <Field
                            name="password"
                            type="password"
                            component={InputField}
                            label="Password *"
                            labelClass="input-title"
                            placeholder="Enter your password"
                          />
                          <TwitterButton
                            setUserId={x => this.setUserId(x, setFieldValue)}
                          />
                          <a href="https://orcid.org/oauth/authorize?client_id=APP-D7HK0ZRV7DLASQHI&response_type=code&scope=/authenticate&redirect_uri=http://localhost:3001/register">
                            Connect with Orcid
                          </a>
                          <div className="subtitle">Detailed Info</div>
                          <Field
                            name="name"
                            type="text"
                            component={InputField}
                            label="Name *"
                            labelClass="input-title"
                            placeholder="Enter your name"
                          />
                          <Field
                            name="research_area"
                            type="text"
                            component={InputField}
                            label="Research Area *"
                            labelClass="input-title"
                            placeholder="Enter your subject"
                          />
                          <Field
                            name="institution"
                            type="text"
                            component={InputField}
                            label="Institution *"
                            labelClass="input-title"
                            placeholder="Enter the name of your institution"
                          />
                          <FieldArray
                            name="interests"
                            component={props => (
                              <TagField {...props} label="Interests" />
                            )}
                          />
                          {registerError ? <p>{registerError}</p> : null}
                        </div>
                      </div>
                      <div className="col-md-4 about-area">
                        <div className="picture-area">
                          <div className="photo-area">
                            <Dropzone
                              accept="image/jpeg, image/png"
                              onDrop={ev => this.onDrop(setFieldValue, ev)}
                              multiple={false}
                            >
                              <div className="one-third offset-by-four column">
                                {this.state.imageFiles.length > 0 && (
                                  <div>
                                    {this.state.imageFiles.map(file => (
                                      <img photo="photo" src={file.preview} />
                                    ))}
                                  </div>
                                )}
                              </div>
                            </Dropzone>
                          </div>
                        </div>
                        <div id="description_container">
                          <Field
                            name="description"
                            type="textarea"
                            component={InputField}
                            label="Description"
                          />
                        </div>
                      </div>
                      <div className="row container-confirm-button">
                        <div className="col-md-4" />
                        <div className="col-md-4">
                          <button type="submit">Confirm Registration</button>
                        </div>
                        <div className="col-md-4" />
                      </div>
                    </div>
                  </Form>
                </div>
              )}
            />
          </div>
        )}
        <div className="footer">
          <div className="container">
            <div>Information</div>
            Contacts
          </div>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    signup: creds => dispatch(signup(creds)),
  };
};

const mapStateToProps = state => {
  return {
    registered: state.register.registered,
    registerError: state.register.registerError,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SignUp);
