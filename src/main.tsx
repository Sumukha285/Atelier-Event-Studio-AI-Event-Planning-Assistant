/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * @description Mounts the root React application into the DOM container safely without non-null assertions.
 * @returns {void}
 */
function mountApplication(): void {
  const container = document.getElementById('root');
  if (!container) {
    return;
  }
  createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

mountApplication();
