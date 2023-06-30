import { UrlParser, UrlTransformer } from "../types.ts";
import { getNumericParam, setParamIfDefined, setParamIfUndefined } from "../utils.ts";

export interface ImageEngineParams {
  host?: number;
  width?: number;
  height?: number;
  autoWidthWithFallback?: number;
  auto_width_fallback?: number;
  scaleToScreenWidth?: number;
  scale_to_screen_width?: number;
  crop?: number;
  outputFormat?: string;
  format?: string;
  fitMethod?: string;
  fit?: string;
  compression?: number;
  sharpness?: number;
  rotate?: number;
  keepMeta?: boolean;
  keep_meta?: boolean;
  noOptimization?: boolean;
  no_optimization?: boolean;
  force_download?: boolean;
  max_device_pixel_ratio?: number;
  maxDevicePixelRatio?: number;
}

export const OBJECT_TO_DIRECTIVES_MAP: { [key: string]: string } = {
  width: "w",
  height: "h",
  autoWidthWithFallback: "w_auto",
  auto_width_fallback: "w_auto",
  scaleToScreenWidth: "pc",
  scale_to_screen_width: "pc",
  crop: "cr",
  outputFormat: "f",
  format: "f",
  fit: "m",
  fitMethod: "m",
  compression: "cmpr",
  sharpness: "s",
  rotate: "r",
  inline: "in",
  keepMeta: "meta",
  keep_meta: "meta",
  noOptimization: "pass",
  no_optimization: "pass",
  force_download: "dl",
  max_device_pixel_ratio: "maxdpr",
  maxDevicePixelRatio: "maxdpr"
};

export const parse: UrlParser<ImageEngineParams> = (
  imageUrl,
) => {
  const parsedUrl = new URL(imageUrl);
  const paramArray = getParameterArray(parsedUrl);
  const baseUrl = getBaseUrl(parsedUrl);
  let width = undefined, height = undefined,format = undefined; 
  const params: Record<string, string> = {};
  if(paramArray.length>0){
    paramArray.forEach((para:string) => {
      let key_value = para.split("_")
      if(key_value.length>1){
        switch(key_value[0]){
          case 'w':
          width = Number(key_value[1]);
          break; 
          case 'h':
            height = Number(key_value[1]);
            break;
          case 'f':
            format = key_value[1];
            break;
          default:
            if( Object.values(OBJECT_TO_DIRECTIVES_MAP).includes(key_value[0])){
              let directive: string = getDirective(key_value[0])
              params[directive] = key_value[1];
            }            
        }
      }
    });
  }
  return {
    base: baseUrl,
    width,
    height,    
    format,
    params,
    cdn: "imageengine",
  };
};

export function getDirective(key: string):string{
  let keyArray = Object.keys(OBJECT_TO_DIRECTIVES_MAP)
  let directive = keyArray.find(k => OBJECT_TO_DIRECTIVES_MAP[k] === key) || ""
  return directive;
};

export function getParameterArray(url: URL){
  let url_string = url.toString();
  let paramArray:any = []
  if(url_string){
    let splitURL: string[] = url_string.split("imgeng=");
    if(splitURL.length>1){
      paramArray = splitURL[1].split("/")
    }      
  }
  return paramArray;
};

export function getBaseUrl(url: URL){
  let url_string = url.toString();
  let baseUrl:string = ""
  if(url_string){
    let splitURL: string[] = url_string.split("imgeng=");
    if(splitURL.length>1){
      baseUrl = splitURL[0].slice(0,-1)
    }
    else  
      baseUrl = url_string;      
  }
  return baseUrl;
};

export const transform: UrlTransformer = (
  { url: originalUrl, width, height, format},
) => {
  const url = new URL(originalUrl);
  const src = getBaseUrl(url);
  let directives: Record<string, any> = {};
  const param: [] = url.toString() === src ? [] : getParameterArray(url);
  if(param.length){
    directives = getDirectives(param)
  }
  if(width)
    directives["width"] = width; 
  if(height)
    directives["height"] = height;
  if(format)
    directives["format"] = format;
  if(!directives.hasOwnProperty('fit')){
    directives = {...directives,"fit": "fill"};
  }
  let directives_string = build_IE_directives(directives);
  let query_string = build_IE_query_string(directives_string);
  let query_prefix = query_string === "" ? "" :	(src.includes("?") ? "&" : "?");    
  return `${src}${query_prefix}${query_string}`;  
};

export function build_IE_directives(directives:any): string {
  return Object.entries(directives).reduce((acc, [k, v]) => {
    return acc + maybe_create_directive(k, v)
    }, "");
};

export function build_IE_query_string(directives_string: string): string {
  if (directives_string && directives_string !== "") {
    return `imgeng=${directives_string}`;
  }
  return ""
};

export function maybe_create_directive(directive: string, value: any): string {
  let translated_directive = OBJECT_TO_DIRECTIVES_MAP[directive];

  if (translated_directive && (value || value === 0)) {
    return `/${translated_directive}_${value}`;
  }
  return "";
};

export function getDirectives(paramArray: []): {}{
  let directives: Record<string, any> = {};
  paramArray.forEach((para:string)=>{
    let keyValue = para.split("_");
    if(keyValue.length>1){
      let key = keyValue[0];
      let value = keyValue[1];
      let directiveKey = getDirective(key);
      if(directiveKey){
        directives[directiveKey] = value;
      }
    }
  })
  return directives
}