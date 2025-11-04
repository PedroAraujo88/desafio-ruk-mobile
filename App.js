import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, ScrollView, FlatList } from 'react-native';
import { ApolloClient, InMemoryCache, createHttpLink, ApolloProvider, gql, useMutation, useQuery } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { registerRootComponent } from 'expo';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// SUBSTITUA O IP DE REDE REAL AQUI (Seu IP é 192.168.0.20)
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

const LOGIN_MUTATION = gql`
  mutation SignIn($email: String!, $password: String!) {
    signIn(signInData: { email: $email, password: $password }) {
      token
    }
  }
`;

const GET_USER_QUERY = gql`
  query GetUser {
    getUser { id name email created_at telephones { number area_code } }
  }
`;

const LIST_USERS_QUERY = gql`
  query ListUsers($name: String) {
    listUsers(name: $name) { id name email }
  }
`;

function LoginScreen({ setIsLoggedIn, setView }) {
  const [email, setEmail] = useState('teste8@desafio.com');
  const [password, setPassword] = useState('SenhaSegura123');
  const [login, { loading }] = useMutation(LOGIN_MUTATION);

  const handleLogin = async () => {
    try {
      const { data } = await login({ variables: { email, password } });
      const token = data.signIn.token;
      global.token = token; 
      setIsLoggedIn(true);
      setView('home');

    } catch (error) {
      Alert.alert('Erro', "Credenciais inválidas ou falha de rede.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Acesso Mobile</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      
      <TouchableOpacity onPress={handleLogin} disabled={loading} style={styles.button}>
        <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.linkButton} onPress={() => Alert.alert('Cadastro', 'Use o formulário web para cadastro inicial.')}>
        <Text style={styles.linkText}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function HomeScreen({ setView, setIsLoggedIn }) {
  const { data, loading, error } = useQuery(GET_USER_QUERY, { fetchPolicy: 'network-only' });
  
  const handleLogout = () => {
    global.token = null;
    setIsLoggedIn(false); 
  };
  
  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4F46E5" /></View>;
  if (error || !data?.getUser) return <View style={styles.center}><Text style={{color:'red'}}>Sessão Expirada.</Text><TouchableOpacity onPress={handleLogout} style={[styles.button, {backgroundColor: '#e74c3c'}]}><Text style={styles.buttonText}>Voltar</Text></TouchableOpacity></View>;

  const user = data.getUser;

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Cartão de Identificação</Text>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>

        {/* Cartão de Identificação (Requisito) */}
        <View style={styles.card}>
            <Text style={styles.cardTitle}>{user.name}</Text>
            <Text style={styles.cardDetail}>Email: {user.email}</Text>
            <Text style={styles.cardDetail}>Criado: {new Date(user.created_at).toLocaleDateString()}</Text>
            {/* ... Telefones ... */}
        </View>

        {/* Botão para Pesquisa */}
        <TouchableOpacity onPress={() => setView('search')} style={[styles.button, {backgroundColor: '#2ecc71', marginTop: 20}]}>
            <Text style={styles.buttonText}>Listar/Buscar Usuários</Text>
        </TouchableOpacity>
    </SafeAreaView>
  );
}

function SearchScreen({ setView }) {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading, error, refetch } = useQuery(LIST_USERS_QUERY, {
    variables: { name: searchTerm || undefined },
    fetchPolicy: 'network-only',
  });
  
  const handleSearchChange = (text) => {
    setSearchTerm(text);
    refetch({ name: text || undefined }); 
  };

  const users = data?.listUsers || [];
  
  return (
    <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => setView('home')} style={styles.backButton}>
            <Text style={styles.backText}>{'< Voltar'}</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Buscar Usuários</Text>
        
        <TextInput
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChangeText={handleSearchChange}
            style={styles.input}
        />
        {loading && <ActivityIndicator size="small" color="#007bff" />}

        <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
            <View style={styles.listItem}>
                <Text style={styles.listItemName}>{item.name}</Text>
                <Text style={styles.listItemEmail}>{item.email}</Text>
            </View>
            )}
            ListEmptyComponent={!loading && <Text style={styles.emptyText}>Nenhum usuário encontrado.</Text>}
        />
    </SafeAreaView>
  );
}

function AppContent() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [view, setView] = useState('home'); 

    useEffect(() => {
        if (global.token) setIsLoggedIn(true);
    }, []);
    
    if (isLoggedIn) {
        return view === 'home' ? <HomeScreen setView={setView} setIsLoggedIn={setIsLoggedIn} /> : <SearchScreen setView={setView} />;
    } else {
        return <LoginScreen setIsLoggedIn={setIsLoggedIn} setView={setView} />;
    }
}

const RootApp = () => (
    <SafeAreaProvider>
        <ApolloProvider client={client}>
            <AppContent />
            <StatusBar style="auto" />
        </ApolloProvider>
    </SafeAreaProvider>
);

registerRootComponent(RootApp); 

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 15 },
    button: { backgroundColor: '#007bff', padding: 15, borderRadius: 8 },
    buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
    linkButton: { marginTop: 10, padding: 10 },
    linkText: { color: '#007bff', textAlign: 'center' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50' },
    logoutButton: { backgroundColor: '#e74c3c', padding: 8, borderRadius: 5 },
    logoutText: { color: '#fff' },
    card: { backgroundColor: '#34495e', padding: 20, borderRadius: 10, marginBottom: 30 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    cardDetail: { fontSize: 14, color: '#bdc3c7', marginTop: 2 },
    listItem: { padding: 15, backgroundColor: '#fff', borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
    listItemName: { fontSize: 16, fontWeight: 'bold' },
    listItemEmail: { fontSize: 14, color: '#7f8c8d' },
});