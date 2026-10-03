import React, { useEffect } from 'react';

/**
 * Adsterra Monetization Scripts Manager
 * Ensures Popunder & Socialbar scripts are loaded and active.
 */
export const AdsterraAds: React.FC = () => {
  useEffect(() => {
    // 1. Popunder Script
    const popunderSrc = 'https://abscloud.org/1/c8eda2ddbb5e063475ce1ba5311c6c99';
    if (!document.querySelector(`script[src="${popunderSrc}"]`)) {
      const script1 = document.createElement('script');
      script1.type = 'text/javascript';
      script1.setAttribute('data-cfasync', 'false');
      script1.src = popunderSrc;
      script1.async = true;
      document.body.appendChild(script1);
    }

    // 2. Socialbar Script
    const socialbarSrc = 'https://bauval.org/14/28503330cce0ee79541d592a41818342';
    if (!document.querySelector(`script[src="${socialbarSrc}"]`)) {
      const script2 = document.createElement('script');
      script2.type = 'text/javascript';
      script2.setAttribute('data-cfasync', 'false');
      script2.src = socialbarSrc;
      script2.async = true;
      document.body.appendChild(script2);
    }
  }, []);

  return null;
};
