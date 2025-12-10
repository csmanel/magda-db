function Welcome() {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold mb-3">Welcome to Magda DB</h2>
        <p className="text-gray-400 mb-6">
          A beautiful, minimal database manager. Create tables and manage your data with ease.
        </p>
        <p className="text-sm text-gray-500">
          Select a table from the sidebar or create a new one to get started.
        </p>
      </div>
    </div>
  )
}

export default Welcome
