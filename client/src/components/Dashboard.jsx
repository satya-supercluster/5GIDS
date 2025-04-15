function Dashboard({ children }) {
  return (
    <div className="max-w-[1200px] w-full min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="w-full mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          5G Intrusion Detection System
        </h1>
        {children}
      </div>
    </div>
  );
}

export default Dashboard;
