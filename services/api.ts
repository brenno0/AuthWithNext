import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';
import { signOut } from '../contexts/AuthContext';


let isRefreshing = false;
let failedRequestsQueue = [];

export function setupApiClient(ctx = undefined) {
    let cookies = parseCookies(ctx);


     const api = axios.create({
        baseURL:"http://localhost:3333/",
        headers:{
            Authorization: `Bearer ${cookies['nextauth.token']}` // Setando os cookies no header de todas as próximas requisições que vão ser feitas Barear é o tipo padrão dos headers e depois passamos a informação/ variável que queremos enviar ao backend
        }
    })
    
    api.interceptors.response.use(response => { // Os interceptors interceptam uma requisição e são constituidos por dois parâmetros, sendo o primeiro o que fazer caso a resposta venha com sucesso e o segundo caso de erro.Também é possivel escolher se quer tomar sua ação antes de fazer a requisiçõ ou depois de receber a resposta desta requisição.
        return response;
    }, (error: AxiosError) => {
        if(error.response.status === 401) {
            if(error.response.data?.code === 'token.expired'){
                cookies = parseCookies(ctx);
    
                const { 'nextauth.refreshToken': refreshToken } = cookies;
    
                let originalConfig = error.config;
    
                if(!isRefreshing) {
                    isRefreshing = true;
                    api.post('/refresh', {  
                        refreshToken,
                    }).then(response => {
                        const { token } = response.data;
                        console.log(response);
        
                        setCookie(ctx, 'nextauth.token', token, {
                            maxAge: 60 * 60 *  24  * 30, // 30 days
                            path:'/' // all pages
             
                        });
                        setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken, {
                         maxAge: 60 * 60 *  24  * 30, // 30 days
                         path:'/' // all pages
                     })
                        api.defaults.headers['Authorization'] = `Bearer ${token}`;
                        failedRequestsQueue.forEach(request => request.resolve(token))
                        failedRequestsQueue = []; 
                    }).catch((err)=> {
                        failedRequestsQueue.forEach(request => request.reject(err))
                        failedRequestsQueue = []; 
    
                        if(process.browser) {
                            signOut()
                        }
                    }).finally(()=> isRefreshing = false);
                }
    
                return new Promise((resolve,reject)=> {
                    failedRequestsQueue.push({
                        resolve:(token:string) => {
                            originalConfig.headers['Authorization'] = `Bearer ${token}`;
    
                            resolve(api(originalConfig));
                        },
                        reject:(err:AxiosError) => {
                            reject(err);
                        }
                    })
                })
            } else {
                if(process.browser) {
                    signOut()
                }
            }
        }
        return Promise.reject(error);
    });

    return api;
}