import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { renderRoutes } from './routes';
import api from '../imports/common/SseAPI.js'

Meteor.startup(() => {
    React.$API = api
    render(renderRoutes(), document.getElementById('app-content'));
});
