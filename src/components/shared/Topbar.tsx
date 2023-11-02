// import React from 'react'
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { useUserContext } from '@/context/AuthContext';
import { useSignOutAccount } from '@/lib/react-query/queriesAndMutations'

const Topbar = () => {

  const navigate = useNavigate();
  const { user } = useUserContext();
  const { mutate: signOut, isSuccess } = useSignOutAccount();

  useEffect(() => {
    if (isSuccess) {
      navigate(0);
    }
  }, [isSuccess, navigate]);

  return (
    <section className="topbar">
      <div className="flex-between py-4 px-5">
        <Link to="/" className="flex gap-3 items-center">
          <img src="/assets/images/logo.svg" alt="logo" width={130} height={325} />
        </Link>

        <div className='flex gap-4'>
          <Button variant="ghost" className='shad-button_ghost' onClick={() => signOut()}>
            <img src="/assets/icons/logout.svg" alt="logo" />
          </Button>

          <Link to={`/profile/${user.id}`} className="flex-center gap-3 ">
            <img
              src={
                user.imageUrl
                || "/public/assets/icons/profile-placeholder.svg"
              }
              alt="profile"

              className='rounded-full h-8 w-8 ' />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Topbar