import React from 'react';

function App() {
  const [count, setCount] = React.useState<number>(0);

  const increment = () => {
    setCount((c) => c + 1);
  };

  const decrement = () => {
    setCount((c) => c - 1);
  };

  return (
    <div>
      <h2>
        Number: <b>{count}</b>
      </h2>
      <br />
      <br />
      <button type="button" onClick={() => increment()}>
        Increment
      </button>{' '}
      <button type="button" onClick={() => decrement()}>
        Decrement
      </button>{' '}
    </div>
  );
}

export default App;
