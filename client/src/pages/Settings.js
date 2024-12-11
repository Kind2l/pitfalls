import Header from "@Components/Header";
import VolumeButtonBackground from "@Components/VolumeButtonBackground";
import VolumeButtonEffects from "@Components/VolumeButtonEffects";
import "@Styles/Settings.scss";

const Settings = () => {
  return (
    <>
      <Header />
      <main className="settings">
        <div className="settings-content">
          <VolumeButtonBackground />
          <VolumeButtonEffects />
        </div>
      </main>
    </>
  );
};

export default Settings;
