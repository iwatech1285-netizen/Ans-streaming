import React from 'react';

interface AdsterraBanner300x250Props {
  className?: string;
  label?: string;
}

export const AdsterraBanner300x250: React.FC<AdsterraBanner300x250Props> = ({ 
  className = '', 
  label = 'Sponsored' 
}) => {
  const iframeContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=300, height=250, initial-scale=1.0">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        background: transparent; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        width: 300px; 
        height: 250px; 
        overflow: hidden; 
      }
    </style>
  </head>
  <body>
    <script type="text/javascript">
      atOptions = {
        'key' : 'aa87147beef174eed71676852caafb35',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    </script>
    <script type="text/javascript" src="https://bauval.org/22/aa87147beef174eed71676852caafb35"></script>
  </body>
</html>`;

  return (
    <div className={`flex flex-col items-center justify-center my-4 ${className}`}>
      {label && (
        <span className="text-[10px] tracking-wider uppercase text-neutral-500 font-semibold mb-1.5 text-center">
          {label}
        </span>
      )}
      <div className="w-[300px] h-[250px] bg-neutral-950 border border-white/10 rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex items-center justify-center">
        <iframe
          srcDoc={iframeContent}
          width="300"
          height="250"
          title="Adsterra 300x250 Banner"
          scrolling="no"
          className="w-[300px] h-[250px] border-0"
        />
      </div>
    </div>
  );
};
