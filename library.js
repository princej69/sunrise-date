 
 /* 
   (c)2011-2015,VladimirAgafonkin 
  SunCalcisaJavaScriptlibraryforcalculatingsun/moonpositionandlightphases. 
  https://github.com/mourner/suncalc 
  */ 
  
  ( function  ( )  {  'usestrict' ; 
  
  //shortcutsforeasiertoreadformulas 
  
  var  PI  =  Math . PI , 
   sin  =  Math . sin , 
   cos  =  Math . cos , 
   tan  =  Math . tan , 
   asin  =  Math . asin , 
   atan  =  Math . atan2 , 
   acos  =  Math . acos , 
   rad  =  PI  /  180 ; 
  
  //suncalculationsarebasedonhttp://aa.quae.nl/en/reken/zonpositie.htmlformulas 
  
  
  //date/timeconstantsandconversions 
  
  var  dayMs  =  1000  *  60  *  60  *  24 , 
   J1970  =  2440588 , 
   J2000  =  2451545 ; 
  
  function  toJulian ( date )  {  return  date . valueOf ( )  /  dayMs  -  0.5  +  J1970 ;  } 
  function  fromJulian ( j )  {  return  new  Date ( ( j  +  0.5  -  J1970 )  *  dayMs ) ;  } 
  function  toDays ( date )  {  return  toJulian ( date )  -  J2000 ;  } 
  
  
  //generalcalculationsforposition 
  
  var  e  =  rad  *  23.4397 ;  //obliquityoftheEarth 
  
  function  rightAscension ( l ,  b )  {  return  atan ( sin ( l )  *  cos ( e )  -  tan ( b )  *  sin ( e ) ,  cos ( l ) ) ;  } 
  function  declination ( l ,  b )  {  return  asin ( sin ( b )  *  cos ( e )  +  cos ( b )  *  sin ( e )  *  sin ( l ) ) ;  } 
  
  function  azimuth ( H ,  phi ,  dec )  {  return  atan ( sin ( H ) ,  cos ( H )  *  sin ( phi )  -  tan ( dec )  *  cos ( phi ) ) ;  } 
  function  altitude ( H ,  phi ,  dec )  {  return  asin ( sin ( phi )  *  sin ( dec )  +  cos ( phi )  *  cos ( dec )  *  cos ( H ) ) ;  } 
  
  function  siderealTime ( d ,  lw )  {  return  rad  *  ( 280.16  +  360.9856235  *  d )  -  lw ;  } 
  
  function  astroRefraction ( h )  { 
   if  ( h  <  0 )  //thefollowingformulaworksforpositivealtitudesonly. 
   h  =  0 ;  //ifh=-0.08901179adiv/0wouldoccur. 
  
   //formula16.4of"AstronomicalAlgorithms"2ndeditionbyJeanMeeus(Willmann-Bell,Richmond)1998. 
   //1.02/tan(h+10.26/(h+5.10))hindegrees,resultinarcminutes->convertedtorad: 
   return  0.0002967  /  Math . tan ( h  +  0.00312536  /  ( h  +  0.08901179 ) ) ; 
  } 
  
  //generalsuncalculations 
  
  function  solarMeanAnomaly ( d )  {  return  rad  *  ( 357.5291  +  0.98560028  *  d ) ;  } 
  
  function  eclipticLongitude ( M )  { 
  
   var  C  =  rad  *  ( 1.9148  *  sin ( M )  +  0.02  *  sin ( 2  *  M )  +  0.0003  *  sin ( 3  *  M ) ) ,  //equationofcenter 
   P  =  rad  *  102.9372 ;  //perihelionoftheEarth 
  
   return  M  +  C  +  P  +  PI ; 
  } 
  
  function  sunCoords ( d )  { 
  
   var  M  =  solarMeanAnomaly ( d ) , 
   L  =  eclipticLongitude ( M ) ; 
  
   return  { 
   dec : declination ( L ,  0 ) , 
   ra : rightAscension ( L ,  0 ) 
   } ; 
  } 
  
  
  var  SunCalc  =  { } ; 
  
  
  //calculatessunpositionforagivendateandlatitude/longitude 
  
  SunCalc . getPosition  =  function  ( date ,  lat ,  lng )  { 
  
   var  lw  =  rad  *  - lng , 
   phi  =  rad  *  lat , 
   d  =  toDays ( date ) , 
  
   c  =  sunCoords ( d ) , 
   H  =  siderealTime ( d ,  lw )  -  c . ra ; 
  
   return  { 
   azimuth : azimuth ( H ,  phi ,  c . dec ) , 
   altitude : altitude ( H ,  phi ,  c . dec ) 
   } ; 
  } ; 
  
  
  //suntimesconfiguration(angle,morningname,eveningname) 
  
  var  times  =  SunCalc . times  =  [ 
   [ - 0.833 ,  'sunrise' ,  'sunset'  ] , 
   [  - 0.3 ,  'sunriseEnd' ,  'sunsetStart'  ] , 
   [  - 6 ,  'dawn' ,  'dusk'  ] , 
   [  - 12 ,  'nauticalDawn' ,  'nauticalDusk' ] , 
   [  - 18 ,  'nightEnd' ,  'night'  ] , 
   [  6 ,  'goldenHourEnd' ,  'goldenHour'  ] 
  ] ; 
  
  //addsacustomtimetothetimesconfig 
  
  SunCalc . addTime  =  function  ( angle ,  riseName ,  setName )  { 
   times . push ( [ angle ,  riseName ,  setName ] ) ; 
  } ; 
  
  
  //calculationsforsuntimes 
  
  var  J0  =  0.0009 ; 
  
  function  julianCycle ( d ,  lw )  {  return  Math . round ( d  -  J0  -  lw  /  ( 2  *  PI ) ) ;  } 
  
  function  approxTransit ( Ht ,  lw ,  n )  {  return  J0  +  ( Ht  +  lw )  /  ( 2  *  PI )  +  n ;  } 
  function  solarTransitJ ( ds ,  M ,  L )  {  return  J2000  +  ds  +  0.0053  *  sin ( M )  -  0.0069  *  sin ( 2  *  L ) ;  } 
  
  function  hourAngle ( h ,  phi ,  d )  {  return  acos ( ( sin ( h )  -  sin ( phi )  *  sin ( d ) )  /  ( cos ( phi )  *  cos ( d ) ) ) ;  } 
  function  observerAngle ( height )  {  return  - 2.076  *  Math . sqrt ( height )  /  60 ;  } 
  
  //returnssettimeforthegivensunaltitude 
  function  getSetJ ( h ,  lw ,  phi ,  dec ,  n ,  M ,  L )  { 
  
   var  w  =  hourAngle ( h ,  phi ,  dec ) , 
   a  =  approxTransit ( w ,  lw ,  n ) ; 
   return  solarTransitJ ( a ,  M ,  L ) ; 
  } 
  
  
  //calculatessuntimesforagivendate,latitude/longitude,and,optionally, 
  //theobserverheight(inmeters)relativetothehorizon 
  
  SunCalc . getTimes  =  function  ( date ,  lat ,  lng ,  height )  { 
  
   height  =  height  ||  0 ; 
  
   var  lw  =  rad  *  - lng , 
   phi  =  rad  *  lat , 
  
   dh  =  observerAngle ( height ) , 
  
   d  =  toDays ( date ) , 
   n  =  julianCycle ( d ,  lw ) , 
   ds  =  approxTransit ( 0 ,  lw ,  n ) , 
  
   M  =  solarMeanAnomaly ( ds ) , 
   L  =  eclipticLongitude ( M ) , 
   dec  =  declination ( L ,  0 ) , 
  
   Jnoon  =  solarTransitJ ( ds ,  M ,  L ) , 
  
   i ,  len ,  time ,  h0 ,  Jset ,  Jrise ; 
  
  
   var  result  =  { 
   solarNoon : fromJulian ( Jnoon ) , 
   nadir : fromJulian ( Jnoon  -  0.5 ) 
   } ; 
  
   for  ( i  =  0 ,  len  =  times . length ;  i  <  len ;  i  +=  1 )  { 
   time  =  times [ i ] ; 
   h0  =  ( time [ 0 ]  +  dh )  *  rad ; 
  
   Jset  =  getSetJ ( h0 ,  lw ,  phi ,  dec ,  n ,  M ,  L ) ; 
   Jrise  =  Jnoon  -  ( Jset  -  Jnoon ) ; 
  
   result [ time [ 1 ] ]  =  fromJulian ( Jrise ) ; 
   result [ time [ 2 ] ]  =  fromJulian ( Jset ) ; 
   } 
  
   return  result ; 
  } ; 
  
  
  //mooncalculations,basedonhttp://aa.quae.nl/en/reken/hemelpositie.htmlformulas 
  
  function  moonCoords ( d )  {  //geocentriceclipticcoordinatesofthemoon 
  
   var  L  =  rad  *  ( 218.316  +  13.176396  *  d ) ,  //eclipticlongitude 
   M  =  rad  *  ( 134.963  +  13.064993  *  d ) ,  //meananomaly 
   F  =  rad  *  ( 93.272  +  13.229350  *  d ) ,  //meandistance 
  
   l  =  L  +  rad  *  6.289  *  sin ( M ) ,  //longitude 
   b  =  rad  *  5.128  *  sin ( F ) ,  //latitude 
   dt  =  385001  -  20905  *  cos ( M ) ;  //distancetothemooninkm 
  
   return  { 
   ra : rightAscension ( l ,  b ) , 
   dec : declination ( l ,  b ) , 
   dist : dt 
   } ; 
  } 
  
  SunCalc . getMoonPosition  =  function  ( date ,  lat ,  lng )  { 
  
   var  lw  =  rad  *  - lng , 
   phi  =  rad  *  lat , 
   d  =  toDays ( date ) , 
  
   c  =  moonCoords ( d ) , 
   H  =  siderealTime ( d ,  lw )  -  c . ra , 
   h  =  altitude ( H ,  phi ,  c . dec ) , 
   //formula14.1of"AstronomicalAlgorithms"2ndeditionbyJeanMeeus(Willmann-Bell,Richmond)1998. 
   pa  =  atan ( sin ( H ) ,  tan ( phi )  *  cos ( c . dec )  -  sin ( c . dec )  *  cos ( H ) ) ; 
  
   h  =  h  +  astroRefraction ( h ) ;  //altitudecorrectionforrefraction 
  
   return  { 
   azimuth : azimuth ( H ,  phi ,  c . dec ) , 
   altitude : h , 
   distance : c . dist , 
   parallacticAngle : pa 
   } ; 
  } ; 
  
  
  //calculationsforilluminationparametersofthemoon, 
  //basedonhttp://idlastro.gsfc.nasa.gov/ftp/pro/astro/mphase.proformulasand 
  //Chapter48of"AstronomicalAlgorithms"2ndeditionbyJeanMeeus(Willmann-Bell,Richmond)1998. 
  
  SunCalc . getMoonIllumination  =  function  ( date )  { 
  
   var  d  =  toDays ( date  ||  new  Date ( ) ) , 
   s  =  sunCoords ( d ) , 
   m  =  moonCoords ( d ) , 
  
   sdist  =  149598000 ,  //distancefromEarthtoSuninkm 
  
   phi  =  acos ( sin ( s . dec )  *  sin ( m . dec )  +  cos ( s . dec )  *  cos ( m . dec )  *  cos ( s . ra  -  m . ra ) ) , 
   inc  =  atan ( sdist  *  sin ( phi ) ,  m . dist  -  sdist  *  cos ( phi ) ) , 
   angle  =  atan ( cos ( s . dec )  *  sin ( s . ra  -  m . ra ) ,  sin ( s . dec )  *  cos ( m . dec )  - 
   cos ( s . dec )  *  sin ( m . dec )  *  cos ( s . ra  -  m . ra ) ) ; 
  
   return  { 
   fraction : ( 1  +  cos ( inc ) )  /  2 , 
   phase : 0.5  +  0.5  *  inc  *  ( angle  <  0 ? - 1 : 1 )  /  Math . PI , 
   angle : angle 
   } ; 
  } ; 
  
  
  function  hoursLater ( date ,  h )  { 
   return  new  Date ( date . valueOf ( )  +  h  *  dayMs  /  24 ) ; 
  } 
  
  //calculationsformoonrise/settimesarebasedonhttp://www.stargazing.net/kepler/moonrise.htmlarticle 
  
  SunCalc . getMoonTimes  =  function  ( date ,  lat ,  lng ,  inUTC )  { 
   var  t  =  new  Date ( date ) ; 
   if  ( inUTC )  t . setUTCHours ( 0 ,  0 ,  0 ,  0 ) ; 
   else  t . setHours ( 0 ,  0 ,  0 ,  0 ) ; 
  
   var  hc  =  0.133  *  rad , 
   h0  =  SunCalc . getMoonPosition ( t ,  lat ,  lng ) . altitude  -  hc , 
   h1 ,  h2 ,  rise ,  set ,  a ,  b ,  xe ,  ye ,  d ,  roots ,  x1 ,  x2 ,  dx ; 
  
   //goin2-hourchunks,eachtimeseeingifa3-pointquadraticcurvecrosseszero(whichmeansriseorset) 
   for  ( var  i  =  1 ;  i  <=  24 ;  i  +=  2 )  { 
   h1  =  SunCalc . getMoonPosition ( hoursLater ( t ,  i ) ,  lat ,  lng ) . altitude  -  hc ; 
   h2  =  SunCalc . getMoonPosition ( hoursLater ( t ,  i  +  1 ) ,  lat ,  lng ) . altitude  -  hc ; 
  
   a  =  ( h0  +  h2 )  /  2  -  h1 ; 
   b  =  ( h2  -  h0 )  /  2 ; 
   xe  =  - b  /  ( 2  *  a ) ; 
   ye  =  ( a  *  xe  +  b )  *  xe  +  h1 ; 
   d  =  b  *  b  -  4  *  a  *  h1 ; 
   roots  =  0 ; 
  
   if  ( d  >=  0 )  { 
   dx  =  Math . sqrt ( d )  /  ( Math . abs ( a )  *  2 ) ; 
   x1  =  xe  -  dx ; 
   x2  =  xe  +  dx ; 
   if  ( Math . abs ( x1 )  <=  1 )  roots ++ ; 
   if  ( Math . abs ( x2 )  <=  1 )  roots ++ ; 
   if  ( x1  <  - 1 )  x1  =  x2 ; 
   } 
  
   if  ( roots  ===  1 )  { 
   if  ( h0  <  0 )  rise  =  i  +  x1 ; 
   else  set  =  i  +  x1 ; 
  
   }  else  if  ( roots  ===  2 )  { 
   rise  =  i  +  ( ye  <  0 ? x2 : x1 ) ; 
   set  =  i  +  ( ye  <  0 ? x1 : x2 ) ; 
   } 
  
   if  ( rise  &&  set )  break ; 
  
   h0  =  h2 ; 
   } 
  
   var  result  =  { } ; 
  
   if  ( rise )  result . rise  =  hoursLater ( t ,  rise ) ; 
   if  ( set )  result . set  =  hoursLater ( t ,  set ) ; 
  
   if  ( ! rise  &&  ! set )  result [ ye  >  0 ? 'alwaysUp' : 'alwaysDown' ]  =  true ; 
  
   return  result ; 
  } ; 
  
  
  //exportasNodemodule/AMDmodule/browservariable 
  if  ( typeof  exports  ===  'object'  &&  typeof  module  !==  'undefined' )  module . exports  =  SunCalc ; 
  else  if  ( typeof  define  ===  'function'  &&  define . amd )  define ( SunCalc ) ; 
  else  window . SunCalc  =  SunCalc ; 
  
  } ( ) ) ;