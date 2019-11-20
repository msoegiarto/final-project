import React, { useContext, useState } from 'react';
import axios from 'axios';
import config from '../config';

axios.defaults.baseURL = config.baseMtlApiUrl;

const getRequestHeaders = (accessToken, contentType) => {
  return {
    'Content-Type': contentType,
    Authorization: `Bearer ${accessToken}`
  };
}

const getRequestUser = user => {
  return {
    email: user.email,
    authentication: user.sub,
    nickname: user.nickname,
  };
}

export const TxtransContext = React.createContext();
export const useTxtrans = () => useContext(TxtransContext);

export const TxtransProvider = ({ children }) => {
  const [loadFiles, setLoadFiles] = useState(true);
  const [contextTranslatedFiles, setContextTranslatedFiles] = useState([]);

  const retrieveUserSavedFilesOrSaveNewUser = async (accessToken, user) => {
    setLoadFiles(true);
    const headers = getRequestHeaders(accessToken, 'application/json');
    const data = getRequestUser(user);

    try {
      const response = await axios({
        url: '/api/translate/documents',
        method: 'POST',
        headers: headers,
        data: data,
      });
      setContextTranslatedFiles(response.data.translatedFiles);
    } catch (err) {
      throw err;
    } finally {
      setLoadFiles(false);
    }
  };

  const doTranslateFiles = async (accessToken, user, files, sourceLanguage, targetLanguage) => {
    const headers = getRequestHeaders(accessToken, 'multipart/form-data');

    const formData = new FormData();
    formData.append('authentication', user.sub);
    formData.append('email', user.email);
    formData.append('sourceLanguage', sourceLanguage);
    formData.append('targetLanguage', targetLanguage);
    files.forEach(file => {
      formData.append('file', file, file.name);
    });

    try {
      // this endpoint will only save the uploaded file into the db without calling translation api
      // const response = await axios({
      //   url: '/api/translate/documents/save_test',
      //   method: 'POST',
      //   headers: headers,
      //   data: formData,
      // });

      // this endpoint is the real translation api
      const response = await axios({
        url: '/api/translate/documents/translate',
        method: 'POST',
        headers: headers,
        data: formData,
      });

      setContextTranslatedFiles(response.data.translatedFiles);
    } catch (err) {
      throw err;
    }
  }

  const doDownloadFiles = async (accessToken, user, id) => {
    const headers = getRequestHeaders(accessToken, 'application/json');
    const data = getRequestUser(user);

    if (id === 'ALL') {
      const tobeDownloadedFileIds = [];
      contextTranslatedFiles.forEach(element => tobeDownloadedFileIds.push({ id: element.id }));
      data.translatedFileIds = tobeDownloadedFileIds;
    } else {
      data.translatedFileIds = [{ id: id }];
    }

    try {
      const response = await axios({
        url: '/api/translate/documents/download',
        method: 'POST',
        headers: headers,
        responseType: 'blob',
        data: data
      });
      return response;
    } catch (err) {
      throw err;
    }
  }

  const doDeleteFiles = async (accessToken, user, id) => {
    const headers = getRequestHeaders(accessToken, 'application/json');
    const data = getRequestUser(user);

    if (id === 'ALL') {
      const tobeDeletedFileIds = [];
      contextTranslatedFiles.forEach(file => { tobeDeletedFileIds.push({ id: file.id }) });
      data.translatedFileIds = tobeDeletedFileIds;
    } else {
      data.translatedFileIds = [{ id: id }];
    }

    try {
      const response = await axios({
        url: '/api/translate/documents/delete',
        method: 'DELETE',
        headers: headers,
        data: data
      });
      setContextTranslatedFiles(response.data.translatedFiles);
    } catch (err) {
      throw err;
    }
  }

  return (
    <TxtransContext.Provider
      value={{
        loadFiles,
        contextTranslatedFiles,
        retrieveUserSavedFilesOrSaveNewUser,
        doTranslateFiles,
        doDownloadFiles,
        doDeleteFiles
      }}>
      {children}
    </TxtransContext.Provider>
  );
}