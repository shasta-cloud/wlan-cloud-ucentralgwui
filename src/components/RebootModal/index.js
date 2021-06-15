import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
  CCol,
  CRow,
  CInvalidFeedback,
} from '@coreui/react';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-widgets/DatePicker';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { convertDateToUtc, convertDateFromUtc, dateToUnix } from 'utils/helper';
import 'react-widgets/styles.css';
import { getToken } from 'utils/authHelper';
import axiosInstance from 'utils/axiosInstance';
import eventBus from 'utils/eventBus';
import LoadingButton from 'components/LoadingButton';
import SuccessfulActionModalBody from 'components/SuccessfulActionModalBody/SuccessfulActionModalBody';

const ActionModal = ({ show, toggleModal }) => {
  const { t } = useTranslation();
  const [hadSuccess, setHadSuccess] = useState(false);
  const [hadFailure, setHadFailure] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [validDate, setValidDate] = useState(true);
  const [chosenDate, setChosenDate] = useState(new Date().toString());
  const [doingNow, setDoingNow] = useState(false);
  const [responseBody, setResponseBody] = useState('');
  const selectedDeviceId = useSelector((state) => state.selectedDeviceId);

  const setDateToLate = () => {
    const date = convertDateToUtc(new Date());
    if (date.getHours() >= 3) {
      date.setDate(date.getDate() + 1);
    }
    date.setHours(3);
    date.setMinutes(0);

    setChosenDate(convertDateFromUtc(date).toString());
  };

  const setDate = (date) => {
    if (date) {
      setChosenDate(date.toString());
    }
  };

  useEffect(() => {
    if (show) {
      setHadSuccess(false);
      setHadFailure(false);
      setWaiting(false);
      setDoingNow(false);
      setChosenDate(new Date().toString());
      setResponseBody('');
      setValidDate(true);
    }
  }, [show]);

  const doAction = (isNow) => {
    if (isNow !== undefined) setDoingNow(isNow);
    setHadFailure(false);
    setHadSuccess(false);
    setWaiting(true);

    const token = getToken();
    const utcDate = new Date(chosenDate);
    const utcDateString = utcDate.toISOString();

    const parameters = {
      serialNumber: selectedDeviceId,
      when: isNow ? 0 : dateToUnix(utcDateString),
    };

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };

    axiosInstance
      .post(`/device/${encodeURIComponent(selectedDeviceId)}/reboot`, parameters, { headers })
      .then(() => {
        setHadSuccess(true);
      })
      .catch(() => {
        setResponseBody(t("commands.error"));
        setHadFailure(true);
      })
      .finally(() => {
        setDoingNow(false);
        setWaiting(false);
        eventBus.dispatch('actionCompleted', { message: 'An action has been completed' });
      });
  };

  return (
    <CModal show={show} onClose={toggleModal}>
      <CModalHeader closeButton>
        <CModalTitle>{t("reboot.title")}</CModalTitle>
      </CModalHeader>
      {hadSuccess ? (
        <SuccessfulActionModalBody toggleModal={toggleModal} />
      ) : (
        <div>
          <CModalBody>
            <h6>{t("reboot.directions")}</h6>
            <CRow style={{ marginTop: '20px' }}>
              <CCol>
                <CButton onClick={() => doAction(true)} disabled={waiting} block color="primary">
                  {waiting && doingNow ? t("common.loading_ellipsis"): t("common.do_now")}
                  <CSpinner hidden={!waiting || !doingNow} component="span" size="sm" />
                </CButton>
              </CCol>
              <CCol>
                <CButton disabled={waiting} block color="primary" onClick={() => setDateToLate()}>
                  {t("common.later_tonight")}
                </CButton>
              </CCol>
            </CRow>
            <CRow style={{ marginTop: '20px' }}>
              <CCol md="4" style={{ marginTop: '7px' }}>
                <p>{t("common.date")}:</p>
              </CCol>
              <CCol xs="12" md="8">
                <DatePicker
                  selected={new Date(chosenDate)}
                  includeTime
                  className={('form-control', { 'is-invalid': !validDate })}
                  value={new Date(chosenDate)}
                  placeholder="Select custom date"
                  disabled={waiting}
                  onChange={(date) => setDate(date)}
                  min={convertDateToUtc(new Date())}
                />
              </CCol>
            </CRow>
            <CInvalidFeedback>{t("common.need_date")}</CInvalidFeedback>

            <div hidden={!hadSuccess && !hadFailure}>
              <div>
                <pre className="ignore">{responseBody}</pre>
              </div>
            </div>
          </CModalBody>
          <CModalFooter>
            <LoadingButton
              label={t("common.schedule")}
              isLoadingLabel={t("common.loading_ellipsis")}
              isLoading={waiting}
              action={doAction}
              variant="outline"
              block={false}
              disabled={waiting}
            />
            <CButton color="secondary" onClick={toggleModal}>
              {t("common.cancel")}
            </CButton>
          </CModalFooter>
        </div>
      )}
    </CModal>
  );
};

ActionModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,
};

export default ActionModal;
