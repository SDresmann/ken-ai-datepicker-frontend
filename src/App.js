import React, { useState } from 'react';
import moment from 'moment';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

const API_URL = 'https://ken-ai-datepicker-backend.onrender.com';
const TOTAL_STEPS = 6;

const emptyForm = {
  first_name: '',
  last_name: '',
  email: '',
  address: '',
  city: '',
  fullname_state: '',
  zip: '',
  what_gender_do_you_identify_as_: '',
  what_is_your_racial_and_ethnic_identity_: '',
  class_date: null,
  are_you_still_finishing_high_school: '',
  whats_the_full_name_of_your_school: '',
  what_grade_are_you_currently_in: '',
  highest_level_of_education_: '',
  i_or_a_family_member_i_live_with_receive_the_following_type_of_public_assistancecheck_all_that_apply: [],
  please_check_all_of_these_situations_that_apply_to_you: [],
  are_you_a_parent: 'No',
  how_many_children_do_you_have: '',
  are_you_a_single_parent: '',
  are_you_involved_in_the_justice_system: '',
  what_is_your_status_in_the_justice_system_check_all_that_apply: [],
  what_is_your_offense_status_check_all_that_apply: [],
  what_is_your_system_level_check_all_that_apply: [],
  do_you_grant_permission_for_your_data_as_it_relates_to_this_program_to_be_collected_and_tracked: '',
  i_consent_to_the_irrevocable_right_to_use_my_name__or_a_fictional_name___statement_s__story__photog: false,
  digital_signature: '',
  date_signed: null,
  whats_your_employment_status_pick_only_1: '',
};

const states = ['OH', 'KY', 'IN', 'MI', 'PA', 'Other'];
const genderOptions = ['Female', 'Male', 'Non-binary', 'Prefer not to say', 'Other'];
const ethnicityOptions = ['American Indian or Alaska Native', 'Asian', 'Black or African American', 'Hispanic or Latino', 'White', 'Two or more races', 'Prefer not to say'];
const yesNo = ['Yes', 'No'];

function App() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingStepOne, setIsSavingStepOne] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const toggleCheckboxGroup = (name, value) => {
    setForm((current) => {
      const currentValues = current[name];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];
      return { ...current, [name]: nextValues };
    });
  };

  const isAllowedDate = (date) => {
    const day = date.getDay();
    return day >= 2 && day <= 5;
  };

  const syncStepOneToHubSpot = async () => {
    const date = moment(form.class_date).format('YYYY-MM-DD');
    const payload = {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      address: form.address,
      city: form.city,
      fullname_state: form.fullname_state,
      zip: form.zip,
      what_gender_do_you_identify_as_: form.what_gender_do_you_identify_as_,
      what_is_your_racial_and_ethnic_identity_: form.what_is_your_racial_and_ethnic_identity_,
      class_date: date,
    };

    await axios.post(`${API_URL}/api/bookings/hubspot-step-one`, payload);
  };

  const goNext = async (event) => {
    if (step !== 1) {
      setStep((current) => Math.min(current + 1, TOTAL_STEPS));
      return;
    }

    const formElement = event.currentTarget.form;
    if (!formElement.reportValidity()) return;

    if (!form.class_date) {
      alert('Please choose a class date.');
      return;
    }

    try {
      setIsSavingStepOne(true);
      await syncStepOneToHubSpot();
      setStep((current) => Math.min(current + 1, TOTAL_STEPS));
    } catch (error) {
      console.error('HubSpot sync failed:', error);
      alert('We could not add this first page to HubSpot. Please check the console and try again.');
    } finally {
      setIsSavingStepOne(false);
    }
  };
  const goBack = () => setStep((current) => Math.max(current - 1, 1));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.class_date) {
      alert('Please choose a class date.');
      setStep(1);
      return;
    }

    try {
      setIsSubmitting(true);
      const date = moment(form.class_date).format('YYYY-MM-DD');
      const payload = {
        ...form,
        date,
        class_date: date,
        date_signed: form.date_signed ? moment(form.date_signed).format('YYYY-MM-DD') : '',
      };
      const response = await axios.post(`${API_URL}/api/bookings`, payload);
      console.log('Booked:', response.data, form);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Submission failed:', error);
      alert('The form submitted locally, but booking the class date failed. Please check the console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSelect = (name, label, options) => (
    <label className="field">
      <span>{label}<sup>*</sup></span>
      <select value={form[name]} onChange={(e) => updateField(name, e.target.value)} required>
        <option value=""></option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );

  const renderCheckboxGroup = (name, label, options) => (
    <div className="field checkbox-group">
      <span>{label}<sup>*</sup></span>
      {options.map((option) => (
        <label key={option} className="checkbox-row">
          <input
            type="checkbox"
            checked={form[name].includes(option)}
            onChange={() => toggleCheckboxGroup(name, option)}
          />
          {option}
        </label>
      ))}
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="two-column">
              <label className="field">
                <span>First Name<sup>*</sup></span>
                <input name="first_name" value={form.first_name} onChange={(e) => updateField('first_name', e.target.value)} required />
              </label>
              <label className="field">
                <span>Last Name<sup>*</sup></span>
                <input name="last_name" value={form.last_name} onChange={(e) => updateField('last_name', e.target.value)} required />
              </label>
            </div>
            <label className="field">
              <span>Email<sup>*</sup></span>
              <input name="email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
            </label>
            <label className="field">
              <span>Street Address<sup>*</sup></span>
              <input name="address" value={form.address} onChange={(e) => updateField('address', e.target.value)} required />
            </label>
            <div className="three-column">
              <label className="field">
                <span>City<sup>*</sup></span>
                <input name="city" value={form.city} onChange={(e) => updateField('city', e.target.value)} required />
              </label>
              {renderSelect('fullname_state', 'State', states)}
              <label className="field">
                <span>Postal Code<sup>*</sup></span>
                <input name="zip" value={form.zip} onChange={(e) => updateField('zip', e.target.value)} required />
              </label>
            </div>
            {renderSelect('what_gender_do_you_identify_as_', 'What gender do you identify as?', genderOptions)}
            {renderSelect('what_is_your_racial_and_ethnic_identity_', 'What is your racial and ethnic identity?', ethnicityOptions)}
            <label className="field">
              <span>Class Date<sup>*</sup></span>
              <DatePicker
                selected={form.class_date}
                onChange={(date) => updateField('class_date', date)}
                dateFormat="MM-dd-yyyy"
                filterDate={isAllowedDate}
                className="form-control"
                placeholderText="MM - DD - YYYY"
                minDate={new Date()}
                required
              />
              <small>Choose Tuesday, Wednesday, Thursday, or Friday.</small>
            </label>
          </>
        );
      case 2:
        const isFinishingHighSchool = form.are_you_still_finishing_high_school === 'Yes';
        return (
          <>
            <h2 className="section-heading">School Info</h2>
            {renderSelect('are_you_still_finishing_high_school', 'Are you still finishing High School?', yesNo)}
            {isFinishingHighSchool && (
              <>
                <label className="field">
                  <span>What&apos;s the full name of your school?<sup>*</sup></span>
                  <small>Please don&apos;t put initials. Put &quot;homeschooling&quot; if you are in homeschool.</small>
                  <input name="whats_the_full_name_of_your_school" value={form.whats_the_full_name_of_your_school} onChange={(e) => updateField('whats_the_full_name_of_your_school', e.target.value)} required />
                </label>
                {renderSelect('what_grade_are_you_currently_in', 'What Grade are you currently in?', ['9th', '10th', '11th', '12th', 'Graduated', 'Not applicable'])}
              </>
            )}
            {renderSelect('highest_level_of_education_', 'Highest level of education?', ['Some high school', 'High school diploma/GED', 'Some college', 'Associate degree', 'Bachelor degree', 'Other'])}
          </>
        );
      case 3:
        return (
          <>
            <h2 className="section-heading">Assistance Received</h2>
            {renderCheckboxGroup('i_or_a_family_member_i_live_with_receive_the_following_type_of_public_assistancecheck_all_that_apply', 'I or a family member I live with receive the following type of Public Assistance - Check all that apply', [
              'SNAP/Food Stamps',
              'SSI (Supplemental Security Income)',
              'TANF (Temporary Assistance for Needy Families)',
              'Unemployment Insurance',
              'Medicaid',
              'NONE OF THESE APPLY TO ME',
            ])}
            {renderCheckboxGroup('please_check_all_of_these_situations_that_apply_to_you', 'Please check all of these situations that apply to you:', [
              "I'm currently Homeless",
              'I Acknowledge a Disability',
              "I'm in Foster Care or I aged out of Foster Care",
              "I'm Pregnant",
              'NONE OF THESE APPLY TO ME',
            ])}
          </>
        );
      case 4:
        const isParent = form.are_you_a_parent === 'Yes';
        return (
          <>
            <h2 className="section-heading">Parent Status</h2>
            {renderSelect('are_you_a_parent', 'Are you a Parent?', yesNo)}
            {isParent && (
              <>
                <label className="field">
                  <span>How many children do you have?<sup>*</sup></span>
                  <input name="how_many_children_do_you_have" value={form.how_many_children_do_you_have} onChange={(e) => updateField('how_many_children_do_you_have', e.target.value)} required />
                </label>
                {renderSelect('are_you_a_single_parent', 'Are you a Single Parent?', yesNo)}
              </>
            )}
          </>
        );
      case 5:
        const isJusticeInvolved = form.are_you_involved_in_the_justice_system === 'Yes';
        return (
          <>
            {renderSelect('are_you_involved_in_the_justice_system', 'Are you involved in the Justice System?', yesNo)}
            {isJusticeInvolved && (
              <>
                {renderCheckboxGroup('what_is_your_status_in_the_justice_system_check_all_that_apply', 'What is your status in the Justice System (check all that apply)?', [
                  'Not Applicable - not justice Involved',
                  'Adult Correctional Facility',
                  'Juvenile Detention Facility',
                  'Probation/Parole',
                  'Diversion',
                  'At-Risk',
                  'Other Court Contact',
                ])}
                {renderCheckboxGroup('what_is_your_offense_status_check_all_that_apply', 'What is your offense status (check all that apply)?', [
                  'Not Applicable - not justice Involved',
                  'No Offense/At Risk',
                  'First time offense',
                  'Repeated offenses',
                ])}
                {renderCheckboxGroup('what_is_your_system_level_check_all_that_apply', 'What is your System Level (check all that apply)?', [
                  'Not Applicable - not justice involved',
                  'Adult',
                  'Juvenile',
                ])}
              </>
            )}
          </>
        );
      case 6:
        return (
          <>
            <h2 className="section-heading">Final Details</h2>
            {renderSelect('do_you_grant_permission_for_your_data_as_it_relates_to_this_program_to_be_collected_and_tracked', 'Do you grant permission for your data as it relates to this program to be collected and tracked?', yesNo)}
            <label className="checkbox-row consent">
              <input
                type="checkbox"
                checked={form.i_consent_to_the_irrevocable_right_to_use_my_name__or_a_fictional_name___statement_s__story__photog}
                onChange={(e) => updateField('i_consent_to_the_irrevocable_right_to_use_my_name__or_a_fictional_name___statement_s__story__photog', e.target.checked)}
                required
              />
              I consent to the irrevocable right to use my name (or a fictional name), statement(s)/story, photograph, cinematic image, voice, and/or property for reproduction, publication, and other use by the or its designee.
            </label>
            <div className="two-column">
              <label className="field">
                <span>Digital Signature<sup>*</sup></span>
                <input name="digital_signature" value={form.digital_signature} onChange={(e) => updateField('digital_signature', e.target.value)} required />
              </label>
              <label className="field">
                <span>Date Signed<sup>*</sup></span>
                <DatePicker
                  selected={form.date_signed}
                  onChange={(date) => updateField('date_signed', date)}
                  dateFormat="MM-dd-yyyy"
                  className="form-control"
                  placeholderText="MM - DD - YYYY"
                  required
                />
              </label>
            </div>
            {renderSelect('whats_your_employment_status_pick_only_1', "What's Your Employment Status? (Pick Only 1)", ['Employed full-time', 'Employed part-time', 'Unemployed', 'Student', 'Other'])}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <main className="app-shell">
      {isSubmitted ? (
        <section className="survey-card thank-you-card">
          <h1>Thank you for submitting</h1>
          <p>We received your form and booked your selected class date.</p>
        </section>
      ) : (
      <form className="survey-card" onSubmit={handleSubmit}>
        <h1>KA | Ready.Set.Hire.</h1>
        <div className="step-content">{renderStep()}</div>
        <div className="progress-label">{step}/{TOTAL_STEPS}</div>
        <div className="progress-bar">
          <div style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
        </div>
        <div className="form-actions">
          {step > 1 ? (
            <button type="button" onClick={goBack}>Previous</button>
          ) : <span />}
          {step < TOTAL_STEPS ? (
            <button type="button" onClick={goNext} disabled={isSavingStepOne}>
              {isSavingStepOne ? 'Saving...' : 'Next'}
            </button>
          ) : (
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      </form>
      )}
    </main>
  );
}

export default App;
