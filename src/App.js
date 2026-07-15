import React, { useEffect, useState } from 'react';
import moment from 'moment';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://ken-ai-datepicker-backend.onrender.com');
const TOTAL_STEPS = 7;

const emptyForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '+1 ',
  marketing_message_consent: false,
  address: '',
  city: '',
  fullname_state: '',
  zip: '',
  are_you_under_18_years_old: '',
  date_of_birth: null,
  what_gender_do_you_identify_as_: '',
  what_is_your_racial_and_ethnic_identity_: '',
  which_career_readiness_date_are_you_interested_in_attending_work: null,
  choose_the_2nd_date_for_your_career_readiness_class_work: null,
  choose_the_3rd_date_for_your_career_readiness_class_work: null,
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
  are_you_unemployed: '',
};

const states = ['OH', 'KY', 'IN', 'MI', 'PA', 'Other'];
const genderOptions = ['Female', 'Male', 'Non-binary', 'Prefer not to say', 'Other'];
const ethnicityOptions = ['American Indian or Alaska Native', 'Asian', 'Black or African American', 'Hispanic or Latino', 'White', 'Two or more races', 'Prefer not to say'];
const yesNo = ['Yes', 'No'];
const noneOption = 'NONE OF THESE APPLY TO ME';
const workshopYear = new Date().getFullYear();
const maxWorkshopDate = new Date(workshopYear, 6, 31);
const DATE_PICKER_POPPER_PLACEMENT = 'top-start';
const DATE_PICKER_IFRAME_PLACEMENT = 'bottom-start';

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function getEarliestBookableDate() {
  return addDays(startOfDay(new Date()), 2);
}

function isBeforeEarliestBookableDate(date) {
  return startOfDay(date) < getEarliestBookableDate();
}

function getPastWorkshopDayClassName(date) {
  return isBeforeEarliestBookableDate(date) ? 'workshop-day--past' : '';
}

function formatHubSpotError(error) {
  const data = error?.response?.data || {};
  const hubspotErrors = (data.hubspotErrors || data.hubspot?.errors || [])
    .map((entry) => entry.message)
    .filter(Boolean);

  return [
    data.step && `Step: ${data.step}`,
    data.detail || data.message,
    hubspotErrors.length ? `HubSpot: ${hubspotErrors.join(' | ')}` : null,
    data.attemptedPayload ? `Payload sent: ${JSON.stringify(data.attemptedPayload)}` : null,
    data.skippedProperties?.length ? `Skipped properties: ${data.skippedProperties.join(', ')}` : null,
  ].filter(Boolean).join('\n\n');
}

function buildFormPayload(formData, { formStatus } = {}) {
  const workshopDate = formData.which_career_readiness_date_are_you_interested_in_attending_work;
  const date = workshopDate && moment(workshopDate).isValid()
    ? moment(workshopDate).format('YYYY-MM-DD')
    : '';

  return {
    first_name: formData.first_name,
    last_name: formData.last_name,
    email: formData.email,
    phone: formData.phone,
    marketing_message_consent: formData.marketing_message_consent,
    address: formData.address,
    city: formData.city,
    fullname_state: formData.fullname_state,
    zip: formData.zip,
    are_you_under_18_years_old: formData.are_you_under_18_years_old,
    date_of_birth: formData.date_of_birth ? moment(formData.date_of_birth).format('YYYY-MM-DD') : '',
    what_gender_do_you_identify_as_: formData.what_gender_do_you_identify_as_,
    what_is_your_racial_and_ethnic_identity_: formData.what_is_your_racial_and_ethnic_identity_,
    which_career_readiness_date_are_you_interested_in_attending_work: date,
    class_date: date,
    choose_the_2nd_date_for_your_career_readiness_class_work: formData.choose_the_2nd_date_for_your_career_readiness_class_work
      ? moment(formData.choose_the_2nd_date_for_your_career_readiness_class_work).format('YYYY-MM-DD')
      : '',
    choose_the_3rd_date_for_your_career_readiness_class_work: formData.choose_the_3rd_date_for_your_career_readiness_class_work
      ? moment(formData.choose_the_3rd_date_for_your_career_readiness_class_work).format('YYYY-MM-DD')
      : '',
    are_you_still_finishing_high_school: formData.are_you_still_finishing_high_school,
    whats_the_full_name_of_your_school: formData.whats_the_full_name_of_your_school,
    what_grade_are_you_currently_in: formData.what_grade_are_you_currently_in,
    highest_level_of_education_: formData.highest_level_of_education_,
    i_or_a_family_member_i_live_with_receive_the_following_type_of_public_assistancecheck_all_that_apply:
      formData.i_or_a_family_member_i_live_with_receive_the_following_type_of_public_assistancecheck_all_that_apply,
    please_check_all_of_these_situations_that_apply_to_you: formData.please_check_all_of_these_situations_that_apply_to_you,
    are_you_a_parent: formData.are_you_a_parent,
    how_many_children_do_you_have: formData.how_many_children_do_you_have,
    are_you_a_single_parent: formData.are_you_a_single_parent,
    are_you_involved_in_the_justice_system: formData.are_you_involved_in_the_justice_system,
    what_is_your_status_in_the_justice_system_check_all_that_apply: formData.what_is_your_status_in_the_justice_system_check_all_that_apply,
    what_is_your_offense_status_check_all_that_apply: formData.what_is_your_offense_status_check_all_that_apply,
    what_is_your_system_level_check_all_that_apply: formData.what_is_your_system_level_check_all_that_apply,
    do_you_grant_permission_for_your_data_as_it_relates_to_this_program_to_be_collected_and_tracked:
      formData.do_you_grant_permission_for_your_data_as_it_relates_to_this_program_to_be_collected_and_tracked,
    i_consent_to_the_irrevocable_right_to_use_my_name__or_a_fictional_name___statement_s__story__photog:
      formData.i_consent_to_the_irrevocable_right_to_use_my_name__or_a_fictional_name___statement_s__story__photog,
    digital_signature: formData.digital_signature,
    date_signed: formData.date_signed ? moment(formData.date_signed).format('YYYY-MM-DD') : '',
    whats_your_employment_status_pick_only_1: formData.whats_your_employment_status_pick_only_1,
    career_readiness_form_status: formStatus || '',
    date,
  };
}

function App() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingStepOne, setIsSavingStepOne] = useState(false);
  const [hubspotError, setHubspotError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(null);
  const [isInIframe, setIsInIframe] = useState(false);
  const datePickerPopperPlacement = isInIframe
    ? DATE_PICKER_IFRAME_PLACEMENT
    : DATE_PICKER_POPPER_PLACEMENT;

  const createDatePickerHandlers = (pickerId, onDateChange) => ({
    open: openDatePicker === pickerId,
    onInputClick: () => setOpenDatePicker(pickerId),
    onClickOutside: () => setOpenDatePicker(null),
    onChange: (date) => {
      onDateChange(date);
      setOpenDatePicker(null);
    },
  });

  useEffect(() => {
    const embedded = window.self !== window.top;
    setIsInIframe(embedded);

    if (!embedded) return undefined;

    document.documentElement.classList.add('in-iframe');

    let resizeTimer;
    const notifyParentOfHeight = () => {
      const root = document.getElementById('root');
      const height = Math.ceil((root?.scrollHeight || document.body.scrollHeight) + 24);
      if (height < 400) return;

      window.parent.postMessage(
        { type: 'ken-datepicker-resize', height },
        '*'
      );
    };

    const scheduleHeightUpdate = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        window.requestAnimationFrame(notifyParentOfHeight);
      }, 100);
    };

    scheduleHeightUpdate();

    const resizeObserver = new ResizeObserver(scheduleHeightUpdate);
    if (document.getElementById('root')) {
      resizeObserver.observe(document.getElementById('root'));
    }

    window.addEventListener('resize', scheduleHeightUpdate);

    return () => {
      window.clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleHeightUpdate);
      document.documentElement.classList.remove('in-iframe');
    };
  }, []);

  useEffect(() => {
    if (!isInIframe) return undefined;

    const root = document.getElementById('root');
    if (!root) return undefined;

    const timer = window.setTimeout(() => {
      const height = Math.ceil(root.scrollHeight + 24);
      if (height >= 400) {
        window.parent.postMessage({ type: 'ken-datepicker-resize', height }, '*');
      }
    }, 100);

    return () => window.clearTimeout(timer);
  }, [step, form.which_career_readiness_date_are_you_interested_in_attending_work, form.choose_the_2nd_date_for_your_career_readiness_class_work, form.choose_the_3rd_date_for_your_career_readiness_class_work, openDatePicker, isSubmitted, hubspotError, isInIframe]);

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const updatePhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '').replace(/^1/, '').slice(0, 10);
    updateField('phone', `+1 ${digits}`);
  };

  const toggleCheckboxGroup = (name, value) => {
    setForm((current) => {
      const currentValues = current[name];
      let nextValues;

      if (value === noneOption) {
        nextValues = currentValues.includes(value) ? [] : [value];
      } else {
        const valuesWithoutNone = currentValues.filter((item) => item !== noneOption);
        nextValues = valuesWithoutNone.includes(value)
          ? valuesWithoutNone.filter((item) => item !== value)
          : [...valuesWithoutNone, value];
      }

      return { ...current, [name]: nextValues };
    });
  };

  const getSelectedTuesday = () => {
    const primary = form.which_career_readiness_date_are_you_interested_in_attending_work;
    if (!primary || primary.getDay() !== 2) return null;
    return startOfDay(primary);
  };

  const isAllowedDate = (date) => {
    if (isBeforeEarliestBookableDate(date)) return false;
    if (startOfDay(date) > startOfDay(maxWorkshopDate)) return false;

    const day = date.getDay();
    return day === 2 || day === 5;
  };

  const isAllowedSecondClassDate = (date) => {
    if (date.getDay() !== 3) return false;
    if (isBeforeEarliestBookableDate(date)) return false;
    if (startOfDay(date) > startOfDay(maxWorkshopDate)) return false;

    const tuesday = getSelectedTuesday();
    if (!tuesday) return false;

    return startOfDay(date) > tuesday;
  };

  const isAllowedThirdClassDate = (date) => {
    if (date.getDay() !== 4) return false;
    if (isBeforeEarliestBookableDate(date)) return false;
    if (startOfDay(date) > startOfDay(maxWorkshopDate)) return false;

    const secondDate = form.choose_the_2nd_date_for_your_career_readiness_class_work;
    if (!secondDate) return false;

    return startOfDay(date) > startOfDay(secondDate);
  };

  const updateClassDate = (date) => {
    setForm((current) => ({
      ...current,
      which_career_readiness_date_are_you_interested_in_attending_work: date,
      choose_the_2nd_date_for_your_career_readiness_class_work: null,
      choose_the_3rd_date_for_your_career_readiness_class_work: null,
    }));
  };

  const updateSecondClassDate = (date) => {
    setForm((current) => {
      const thirdDate = current.choose_the_3rd_date_for_your_career_readiness_class_work;
      const shouldClearThird = thirdDate && startOfDay(thirdDate) <= startOfDay(date);

      return {
        ...current,
        choose_the_2nd_date_for_your_career_readiness_class_work: date,
        choose_the_3rd_date_for_your_career_readiness_class_work: shouldClearThird ? null : thirdDate,
      };
    });
  };

  const needsAdditionalClassDates = () => {
    if (!form.which_career_readiness_date_are_you_interested_in_attending_work) return false;
    const day = form.which_career_readiness_date_are_you_interested_in_attending_work.getDay();
    return day === 2;
  };

  const requireCheckboxGroup = (name, message) => {
    if (form[name].length > 0) return true;
    alert(message);
    return false;
  };

  const validateCurrentStep = () => {
    if (step === 4) {
      return (
        requireCheckboxGroup(
          'i_or_a_family_member_i_live_with_receive_the_following_type_of_public_assistancecheck_all_that_apply',
          'Please choose at least one public assistance option.'
        ) &&
        requireCheckboxGroup(
          'please_check_all_of_these_situations_that_apply_to_you',
          'Please choose at least one situation option.'
        )
      );
    }

    if (step === 6 && form.are_you_involved_in_the_justice_system === 'Yes') {
      return (
        requireCheckboxGroup(
          'what_is_your_status_in_the_justice_system_check_all_that_apply',
          'Please choose at least one justice system status option.'
        ) &&
        requireCheckboxGroup(
          'what_is_your_offense_status_check_all_that_apply',
          'Please choose at least one offense status option.'
        ) &&
        requireCheckboxGroup(
          'what_is_your_system_level_check_all_that_apply',
          'Please choose at least one system level option.'
        )
      );
    }

    return true;
  };

  const syncToHubSpot = async () => {
    const payload = buildFormPayload(form, { formStatus: 'Partial' });

    if (!payload.email || !payload.which_career_readiness_date_are_you_interested_in_attending_work) {
      throw new Error('Email and workshop date are required before syncing to HubSpot.');
    }

    console.log('HubSpot sync payload:', payload);
    const response = await axios.post(`${API_URL}/api/bookings/hubspot-step-one`, payload);
    console.log('HubSpot sync saved:', response.data);
    if (response.data.skippedProperties?.length) {
      console.warn('HubSpot skipped custom properties:', response.data.skippedProperties);
    }
    return response.data;
  };

  const goNext = async (event) => {
    const formElement = event.currentTarget.form;
    if (!formElement.reportValidity()) return;
    if (!validateCurrentStep()) return;

    if (step === 1) {
      if (!form.which_career_readiness_date_are_you_interested_in_attending_work) {
        alert('Please choose a workshop date.');
        return;
      }

      if (!moment(form.which_career_readiness_date_are_you_interested_in_attending_work).isValid()) {
        alert('Please choose a valid workshop date (Tuesday or Friday).');
        return;
      }

      if (!isAllowedDate(form.which_career_readiness_date_are_you_interested_in_attending_work)) {
        alert('The first workshop date must be a Tuesday or Friday.');
        return;
      }

      if (needsAdditionalClassDates()) {
        if (!form.choose_the_2nd_date_for_your_career_readiness_class_work || !form.choose_the_3rd_date_for_your_career_readiness_class_work) {
          alert('Please choose both additional workshop date options.');
          return;
        }

        const tuesday = getSelectedTuesday();
        const secondDate = startOfDay(form.choose_the_2nd_date_for_your_career_readiness_class_work);
        const thirdDate = startOfDay(form.choose_the_3rd_date_for_your_career_readiness_class_work);

        if (secondDate <= tuesday) {
          alert('The 2nd workshop date must be a Wednesday after your Tuesday date.');
          return;
        }

        if (thirdDate <= secondDate) {
          alert('The 3rd workshop date must be a Thursday after your 2nd workshop date.');
          return;
        }
      }
    }

    try {
      setIsSavingStepOne(true);
      setHubspotError('');
      await syncToHubSpot();
      setOpenDatePicker(null);
      setStep((current) => Math.min(current + 1, TOTAL_STEPS));
    } catch (error) {
      const formatted = formatHubSpotError(error);
      console.group('HubSpot sync failed');
      console.error('Status:', error.response?.status);
      console.error('Response:', error.response?.data);
      console.error('Formatted:', formatted);
      console.groupEnd();
      setHubspotError(formatted || 'We could not save your progress to HubSpot. Please check the console and try again.');
      alert(formatted || 'We could not save your progress to HubSpot. Please check the console and try again.');
    } finally {
      setIsSavingStepOne(false);
    }
  };
  const goBack = () => {
    setOpenDatePicker(null);
    setStep((current) => Math.max(current - 1, 1));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateCurrentStep()) return;

    if (!form.which_career_readiness_date_are_you_interested_in_attending_work) {
      alert('Please choose a workshop date.');
      setStep(1);
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = buildFormPayload(form, { formStatus: 'Complete' });
      const response = await axios.post(`${API_URL}/api/bookings`, payload);
      console.log('Booked:', response.data, form);
      if (response.data.hubspotError) {
        alert(`Your workshop was booked, but some HubSpot fields may not have saved: ${response.data.hubspotError}`);
      }
      setIsSubmitted(true);
    } catch (error) {
      console.error('Submission failed:', error);
      const detail = error.response?.data?.detail || error.response?.data?.message;
      alert(detail || 'The form submitted locally, but booking the workshop date failed. Please check the console.');
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

  const renderCheckboxGroup = (name, label, options) => {
    const selectedNone = form[name].includes(noneOption);
    const visibleOptions = selectedNone ? options.filter((option) => option === noneOption) : options;

    return (
      <div className="field checkbox-group">
        <span>{label}<sup>*</sup></span>
        {visibleOptions.map((option) => (
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
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        const showAdditionalClassDates = needsAdditionalClassDates();
        return (
          <>
            <h1>KA | Ready.Set.Hire.</h1>
            <h2 className="section-heading">Contact Details</h2>
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
              <span>Phone Number<sup>*</sup></span>
              <div className="phone-input-row">
                <span className="phone-country">🇺🇸</span>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updatePhoneNumber(e.target.value)}
                  pattern="\+1 \d{10}"
                  title="Enter a US phone number with +1 followed by 10 digits."
                  required
                />
              </div>
              <small>US numbers only. Example: +1 5135551234</small>
            </label>
            <label className="field">
              <span>Postal Code<sup>*</sup></span>
              <input name="zip" value={form.zip} onChange={(e) => updateField('zip', e.target.value)} required />
            </label>
            <label className="checkbox-row consent">
              <input
                type="checkbox"
                checked={form.marketing_message_consent}
                onChange={(e) => updateField('marketing_message_consent', e.target.checked)}
                required
              />
              I agree to receive recurring automated marketing emails and text messages at the phone number provided. Consent is not a condition to purchase. Msg &amp; data rates may apply. Msg frequency varies. Reply HELP for help and STOP to cancel. View our Terms and Conditions and Privacy Policy.<sup>*</sup>
            </label>
            <label className="field">
              <span>Which Career Readiness Date Are You Interested in Attending?<sup>*</sup></span>
              <DatePicker
                {...createDatePickerHandlers('workshop-primary', updateClassDate)}
                selected={form.which_career_readiness_date_are_you_interested_in_attending_work}
                dateFormat="MM-dd-yyyy"
                popperPlacement={datePickerPopperPlacement}
                shouldCloseOnSelect
                filterDate={isAllowedDate}
                dayClassName={getPastWorkshopDayClassName}
                className="form-control"
                placeholderText="MM - DD - YYYY"
                minDate={getEarliestBookableDate()}
                maxDate={maxWorkshopDate}
                required
              />
              <small>Tuesday workshops are from 5:00 pm - 6:00 pm cst and Friday workshops are from 2:00 pm - 5:00 pm cst. See below for more details.</small>
            </label>
            {showAdditionalClassDates && (
              <>
                <label className="field">
                  <span>Choose the 2nd Date for your Career Readiness Workshop:<sup>*</sup></span>
                  <DatePicker
                    {...createDatePickerHandlers('workshop-second', updateSecondClassDate)}
                    selected={form.choose_the_2nd_date_for_your_career_readiness_class_work}
                    dateFormat="MM-dd-yyyy"
                    popperPlacement={datePickerPopperPlacement}
                    shouldCloseOnSelect
                    filterDate={isAllowedSecondClassDate}
                    dayClassName={getPastWorkshopDayClassName}
                    className="form-control"
                    placeholderText="MM - DD - YYYY"
                    minDate={getEarliestBookableDate()}
                    maxDate={maxWorkshopDate}
                    required
                  />
                </label>
                <label className="field">
                  <span>Choose the 3rd Date for your Career Readiness Workshop:<sup>*</sup></span>
                  <DatePicker
                    {...createDatePickerHandlers(
                      'workshop-third',
                      (date) => updateField('choose_the_3rd_date_for_your_career_readiness_class_work', date)
                    )}
                    selected={form.choose_the_3rd_date_for_your_career_readiness_class_work}
                    dateFormat="MM-dd-yyyy"
                    popperPlacement={datePickerPopperPlacement}
                    shouldCloseOnSelect
                    filterDate={isAllowedThirdClassDate}
                    dayClassName={getPastWorkshopDayClassName}
                    className="form-control"
                    placeholderText="MM - DD - YYYY"
                    minDate={getEarliestBookableDate()}
                    maxDate={maxWorkshopDate}
                    required
                  />
                </label>
              </>
            )}
          </>
        );
      case 2:
        return (
          <>
            <h2 className="section-heading">Qualifying Information</h2>
            {renderSelect('are_you_under_18_years_old', 'Are you under 18 years old?', yesNo)}
            <label className="field">
              <span>Street Address<sup>*</sup></span>
              <input name="address" value={form.address} onChange={(e) => updateField('address', e.target.value)} required />
            </label>
            <div className="two-column">
              <label className="field">
                <span>City<sup>*</sup></span>
                <input name="city" value={form.city} onChange={(e) => updateField('city', e.target.value)} required />
              </label>
              <label className="field">
                <span>State<sup>*</sup></span>
                <select value={form.fullname_state} onChange={(e) => updateField('fullname_state', e.target.value)} required>
                  <option value=""></option>
                  {states.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="field">
              <span>Date of Birth<sup>*</sup></span>
              <DatePicker
                {...createDatePickerHandlers('date-of-birth', (date) => updateField('date_of_birth', date))}
                selected={form.date_of_birth}
                dateFormat="MM-dd-yyyy"
                popperPlacement={datePickerPopperPlacement}
                shouldCloseOnSelect
                className="form-control"
                placeholderText="MM - DD - YYYY"
                maxDate={new Date()}
                required
              />
            </label>
            {renderSelect('what_gender_do_you_identify_as_', 'What gender do you identify as?', genderOptions)}
            {renderSelect('what_is_your_racial_and_ethnic_identity_', 'What is your racial and ethnic identity?', ethnicityOptions)}
          </>
        );
      case 3:
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
                <label className="field">
                  <span>What Grade are you currently in?<sup>*</sup></span>
                  <small>(If you are completing this form during summer break, please mark the grade you will be starting in August.)</small>
                  <select value={form.what_grade_are_you_currently_in} onChange={(e) => updateField('what_grade_are_you_currently_in', e.target.value)} required>
                    <option value=""></option>
                    {['10th', '11th', '12th'].map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </>
            )}
            {renderSelect('highest_level_of_education_', 'Highest level of education?', [
              '8th grade or below',
              '9th grade',
              '10th grade',
              '11th grade',
              '12th grade - no diploma',
              'High School Diploma',
              'GED',
              'Vocational Training',
              'Some college - no degree',
              'Associate Degree',
              "Bachelor's Degree",
              "Master's degree",
            ])}
          </>
        );
      case 4:
        return (
          <>
            <h2 className="section-heading">Assistance Received</h2>
            {renderCheckboxGroup('i_or_a_family_member_i_live_with_receive_the_following_type_of_public_assistancecheck_all_that_apply', 'I or a family member I live with receive the following type of Public Assistance (check all that apply)', [
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
      case 5:
        const isParent = form.are_you_a_parent === 'Yes';
        return (
          <>
            <h2 className="section-heading">Parent Status</h2>
            {renderSelect('are_you_a_parent', 'Are you a Parent?', yesNo)}
            {isParent && (
              <>
                <label className="field">
                  <span>How many children do you have?<sup>*</sup></span>
                  <input
                    name="how_many_children_do_you_have"
                    type="number"
                    min="0"
                    step="1"
                    value={form.how_many_children_do_you_have}
                    onChange={(e) => updateField('how_many_children_do_you_have', e.target.value)}
                    required
                  />
                </label>
                {renderSelect('are_you_a_single_parent', 'Are you a Single Parent?', yesNo)}
              </>
            )}
          </>
        );
      case 6:
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
      case 7:
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
                  {...createDatePickerHandlers('date-signed', (date) => updateField('date_signed', date))}
                  selected={form.date_signed}
                  dateFormat="MM-dd-yyyy"
                  popperPlacement={datePickerPopperPlacement}
                  shouldCloseOnSelect
                  className="form-control"
                  placeholderText="MM - DD - YYYY"
                  required
                />
              </label>
            </div>
            {renderSelect('whats_your_employment_status_pick_only_1', "What's Your Employment Status? (Pick Only 1)", [
              "I'm Working 1 Full-Time Job",
              "I'm Working 1 Part-Time Job",
              "I'm Working 2 or more Part-Time Jobs",
              "I'm working but not getting enough hours or making what I should be making for my education and skills.",
              "I'm NOT working but I want to work",
            ])}
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
          <h1>Thank you for applying</h1>
          <p>We&apos;ve received your information, and you&apos;ll receive a confirmation email shortly with next steps.</p>
        </section>
      ) : (
      <form className="survey-card" onSubmit={handleSubmit}>
        <div className="step-content">{renderStep()}</div>
        {hubspotError ? (
          <div className="form-error" role="alert">
            <strong>HubSpot error</strong>
            <pre>{hubspotError}</pre>
          </div>
        ) : null}
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
