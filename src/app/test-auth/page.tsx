"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function TestAuthPage() {
  const [status, setStatus] = useState<string>("Not tested");
  const [logs, setLogs] = useState<string[]>([]);
  const supabase = createClient();

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, message]);
  };

  const testConnection = async () => {
    setStatus("Testing...");
    setLogs([]);

    try {
      addLog("1. Checking environment variables...");
      addLog(`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
      addLog(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...`);

      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error("Environment variables are missing!");
      }

      addLog("2. Testing Supabase client creation...");
      const client = createClient();
      addLog("✅ Client created successfully");

      addLog("3. Testing auth.getSession()...");
      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      if (sessionError) {
        addLog(`❌ Session error: ${sessionError.message}`);
      } else {
        addLog(`✅ Session check successful. User: ${sessionData.session?.user?.email || 'Not logged in'}`);
      }

      addLog("4. Testing a simple query...");
      const { data, error } = await client.from('accounts').select('count').limit(1);
      if (error) {
        addLog(`⚠️ Query error: ${error.message}`);
      } else {
        addLog(`✅ Query successful`);
      }

      addLog("5. Testing auth endpoint with invalid credentials...");
      const { error: loginError } = await client.auth.signInWithPassword({
        email: 'test@test.com',
        password: 'wrongpassword'
      });

      if (loginError) {
        if (loginError.message.includes('Invalid')) {
          addLog(`✅ Auth endpoint is working (returned expected error: ${loginError.message})`);
        } else {
          addLog(`❌ Unexpected auth error: ${loginError.message}`);
        }
      }

      setStatus("✅ All tests completed!");
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
      setStatus(`❌ Failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-indigo-400 via-sky-500 to-teal-300">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold mb-4">Supabase Connection Test</h1>

        <div className="mb-6">
          <Button onClick={testConnection} className="w-full">
            Run Connection Test
          </Button>
        </div>

        <div className="mb-4">
          <strong>Status:</strong> {status}
        </div>

        <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm">
          <div className="font-bold mb-2">Console Output:</div>
          {logs.length === 0 ? (
            <div className="text-slate-500">Click the button to run tests...</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="mb-1">{log}</div>
            ))
          )}
        </div>

        <div className="mt-6 text-sm text-slate-600">
          <p>This page tests:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Environment variables are loaded correctly</li>
            <li>Supabase client can be created</li>
            <li>Session checking works</li>
            <li>Database queries work</li>
            <li>Auth endpoint is reachable</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
