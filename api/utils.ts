
export function json(body:any, status=200, headers:Record<string,string>={}){
  return new Response(JSON.stringify(body), { status, headers: {'Content-Type':'application/json', ...headers} })
}
