import mBone from '../assets/m-bone.png';

function Welcome() {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-gradient-to-br from-stone-700 to-amber-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <img
            src={mBone}
            alt="Magda DB Logo"
            className="w-full h-full object-contain p-2"
          />
        </div>
        <h2 className="text-3xl font-bold mb-3">magda-db?</h2>
        <p className="text-sm text-gray-500">
          Select a table from the sidebar or create a new one to get started.
        </p>
      </div>
    </div>
  );
}

export default Welcome;
