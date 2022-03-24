import React, { useState, useEffect } from 'react';
import { Heading } from '@chakra-ui/react';
import instanciateApi from '../services/api';
import { User } from '../store/user.slice';

export default function Users() {
  const [users, setUsers] = useState<User[]>();
  const api = instanciateApi();

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const getUsers = async () => {
      try {
        const response = await api.userApi.getAllInfo({
          signal: controller.signal,
        });
        console.info('data?', response.data);
        if (isMounted) {
          setUsers(response.data.users);
        }
      } catch (error) {
        console.error(error);
      }
    };

    getUsers();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return (
    <article>
      <Heading> Users List </Heading>
      {users?.length ? (
        <ul>
          {users.map((user) => (
            <li key={user.email}>{user.username}</li>
          ))}
        </ul>
      ) : (
        <p>No users to display</p>
      )}
    </article>
  );
}
