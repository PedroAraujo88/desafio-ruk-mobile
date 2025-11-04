import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// SUBSTITUA PELO SEU IP DE REDE REAL (192.168.0.20)
const YOUR_IP = '192.168.0.20'; 
const API_URL = `http://${YOUR_IP}:3000/graphql`; 

const httpLink = createHttpLink({ uri: API_URL });

const authLink = setContext((_, { headers }) => {
  const token = global.token || null; 
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;