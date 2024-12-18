'use client';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Явно устанавливаем React в глобальную область
if (typeof window !== 'undefined') {
  window.React = React;
  window.ReactDOM = ReactDOM;
}

export { React, ReactDOM }; 