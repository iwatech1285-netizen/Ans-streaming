import React, { useEffect, useRef } from 'react';

interface AdsterraNativeBannerProps {
  className?: string;
  label?: string;
}

export const AdsterraNativeBanner: React.FC<AdsterraNativeBannerProps> = ({
  className = '',
  label = 'Recommended Sponsored Content'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = containerRef.current;
    if (!wrapper) return;

    const containerId = 'container-557eb9f9fda42aa766de7b44a1aa88b7';
    
    // Ensure the container div exists
    let target = wrapper.querySelector<HTMLDivElement>(`#${containerId}`);
    if (!target) {
      target = document.createElement('div');
      target.id = containerId;
      target.className = 'w-full flex justify-center';
      wrapper.appendChild(target);
    }

    // Create and append the Adsterra native banner script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://bauval.org/21/557eb9f9fda42aa766de7b44a1aa88b7';

    wrapper.appendChild(script);

    return () => {
      // Clean up on component unmount
      if (wrapper) {
        wrapper.innerHTML = `<div id="${containerId}" class="w-full flex justify-center"></div>`;
      }
    };
  }, []);

  return (
    <div className={`w-full my-8 ${className}`}>
      {label && (
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
          <span className="w-1.5 h-3.5 bg-neutral-500 rounded-full" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            {label}
          </span>
        </div>
      )}
      <div 
        ref={containerRef}
        className="w-full min-h-[140px] bg-neutral-950/70 border border-white/10 rounded-2xl p-4 overflow-hidden flex flex-col items-center justify-center shadow-lg"
      >
        <div id="container-557eb9f9fda42aa766de7b44a1aa88b7" className="w-full flex justify-center" />
      </div>
    </div>
  );
};
