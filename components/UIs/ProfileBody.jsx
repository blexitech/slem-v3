"use client";

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../TEMPLATEs/tabs'

const ProfileBody = () => {
  return (
    <section className='w-full flex flex-col items-center mt-2'>
        <Tabs defaultValue="profile" className="w-[98vw]">
              <TabsList className="w-full justify-between overflow-x-auto">
                <TabsTrigger value="profile">
                  <span className="hidden sm:inline">My NFTs</span>
                  <span className="sm:hidden">NFTs</span>
                </TabsTrigger>
                <TabsTrigger value="student-loan">
                  <span className="hidden sm:inline">My Student Loan</span>
                  <span className="sm:hidden">Debt</span>
                </TabsTrigger>
                <TabsTrigger value="account">
                  <span className="hidden sm:inline">My Socials</span>
                  <span className="sm:hidden">Socials</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                <div className="bg-black border border-amber-500 rounded-lg p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                  <p className="text-gray-300">You currently have no NFTs.</p>
                </div>
              </TabsContent>
              <TabsContent value="student-loan">
                <div className="bg-black border border-amber-500 rounded-lg p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                  <p className="text-gray-300">
                    You have no student loan. Add your student loan in settings.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="account">
                <div className="bg-black border border-amber-500 rounded-lg p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                  <p className="text-gray-300">
                    You have no social links. Add your social links in settings.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
    </section>
  )
}

export default ProfileBody