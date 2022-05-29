import { useQuery } from '@apollo/react-hooks';
import { gql } from '@apollo/client';

function App() {
  const { data, loading } = useQuery(gql`{
    hello
  }`);

  console.log(data, loading);

  if (loading) {
    return <div>Loading...</div>;
  } else {
    return <div>{data.hello}</div>
  }

}

export default App;
