// Simple cookie demo endpoint showing how to read + write cookies in Express.
const { buildResponse } = require('../utils/apiResponse');

// GET /examples/cookies - increments a cookie counter and returns the value.
const cookieExample = (req, res) => {
  const cookies = req.cookies || {};
  const parsedVisits = Number(cookies.cookieDemoVisits);
  const previousVisits = Number.isNaN(parsedVisits) ? 0 : parsedVisits;
  const visits = previousVisits + 1;
  const sample2 = cookies.cookieDemoVisits_sample


  res.cookie('cookieDemoVisits', visits, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  res.cookie('cookieDemoVisits_sample', "abc", {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  return res.json(
    buildResponse(
      {
        visits: visits,
        sample: sample2,
        receivedCookies: cookies,
      },
      'Cookie demo response',
    ),
  );
};

// GET /examples/signed-cookies - showcase signed cookie usage.
const signedCookieExample = (req, res) => {
  const signedCookies = req.signedCookies || {};
  const previousToken = signedCookies.cookieDemoToken || null;
  const newToken = `signed-${Date.now()}`;

  res.cookie('cookieDemoToken', newToken, {
    httpOnly: true,
    sameSite: 'lax',
    signed: true,
    maxAge: 30 * 60 * 1000, // 30 minutes
  });

  return res.json(
    buildResponse(
      {
        previousToken,
        newToken,
        signedCookies,
      },
      'Signed cookie demo response',
    ),
  );
};

module.exports = {
  cookieExample,
  signedCookieExample,
};
