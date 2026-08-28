/* Optional Cloudflare Worker example for FitGlass AI.
   Deploy separately; do NOT place secrets in GitHub Pages files.
*/
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response('', {headers: cors()});
    if (new URL(request.url).pathname !== '/llm') return new Response('Not found', {status:404, headers:cors()});
    try {
      const body = await request.json();
      if (!body || !body.messages || !body.model) return json({error:'Invalid request'},400);
      const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions',{
        method:'POST',
        headers:{'Authorization':`Bearer ${env.GROQ_API_KEY}`,'Content-Type':'application/json'},
        body:JSON.stringify({model:body.model,messages:body.messages,temperature:body.temperature??0.25,max_tokens:Math.min(Number(body.max_tokens)||900,2000)})
      });
      const text = await upstream.text();
      return new Response(text,{status:upstream.status,headers:{...cors(),'Content-Type':'application/json'}});
    } catch (error) { return json({error:String(error.message||error)},500); }
  }
};
function cors(){return {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST,OPTIONS'};}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{...cors(),'Content-Type':'application/json'}});}
