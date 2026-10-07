const paths={
 flute:'M5 12h22M7 10v4m4-4v4m4-4v4m4-4v4m4-4v4',
 clarinet:'M14 3v19m4-19v19m-6 0-3 6h14l-3-6M14 7h4m-4 5h4m-4 5h4',
 harp:'M7 27V5q9-6 18 3l-2 19H7m3-17v13m4-14v14m4-13v13m4-11v11',
 violin:'M16 3v8m-2-6h4M12 12c-8-3-8 6-4 7-7 8 9 13 11 5 6-6 3-14-2-12M16 11v15M6 27 27 6',
 cello:'M16 2v10m-2-7h4M12 12c-7-2-7 6-4 7-6 8 8 12 11 5 6-6 3-14-2-12M16 11v17m0 0v3M5 25 27 7',
 bassoon:'M12 28V8h4v20h-4m4-12h5V3m-9 25h9m-6-14-6-4-3 2m11-4h4m-4 6h4m-4 6h4',
 horn:'M20 19c-1-9-15-9-15 0s15 10 15 0c0-7-10-7-10 0s7 5 7 0M20 15l8-5v17l-8-5M11 10V5h6v5',
 trombone:'M8 6h15m-14 0-4 19q0 4 4 4t4-4L16 8m5-2 7-3v12l-7-3M8 21h7',
 timpani:'M4 12q12-6 24 0v3q-2 14-12 14T4 15v-3m0 0q12 7 24 0M8 24l-3 6m19-6 3 6M8 2l6 7m10-7-6 7',
 cymbals:'M13 15c0-10-11-12-11-2s11 12 11 2m6 2c0-10 11-12 11-2s-11 12-11 2M7 13v4m18-4v4M15 7l2-3m-2 21 2 3'
};
export function icon(id){return `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[id]||paths.flute}"/></svg>`;}
