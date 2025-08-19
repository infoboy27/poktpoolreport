import '@testing-library/jest-dom'

// Polyfill for TextEncoder (needed for pg module in tests)
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;
