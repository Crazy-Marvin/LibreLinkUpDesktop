import { useEffect, useState } from 'react';
import { BaseLayout } from '@/layouts/base-layout';
import { useAuthStore } from '@/stores/auth';
import { getCGMData } from '@/lib/linkup';
import { TrendArrow } from '@/components/ui/trend-arrow';
import {
  EnterFullScreenIcon,
  GearIcon,
} from '@radix-ui/react-icons';
import { useNavigate } from 'react-router-dom';
import { LoadingScreen } from '@/components/ui/loading';
import { useClearSession } from '@/hooks/session';
import { toast } from 'sonner';
import {
  openNewWindow,
  setRedirectTo,
  getUserValue,
  getUserUnit,
  getLocalStorageWindowMode,
  setWindowMode,
  updateTrayNumber,
  getTrayVisibility,
  setTrayVisibility,
} from '@/lib/utils';
import { useGlucoseAlerts } from '@/hooks/useGlucoseAlerts';

const LOW = 70;
const HIGH = 240;

export default function DashboardPage() {
  const { clearSession } = useClearSession();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const country = useAuthStore((state) => state.country);
  const accountId = useAuthStore((state) => state.accountId);
  const [graphData, setGraphData] = useState<any>({});
  const [isReady, setIsReady] = useState(false);
  const [trayVisible, setTrayVisible] = useState<boolean>(true);

  const updateTrayManually = () => {
    if (graphData?.glucoseMeasurement?.ValueInMgPerDl !== undefined &&
        graphData?.glucoseMeasurement?.ValueInMgPerDl !== null) {

      const glucoseValue = getUserValue(graphData.glucoseMeasurement.ValueInMgPerDl);
      const targetLow = graphData?.targetLow ?? 70;
      const targetHigh = graphData?.targetHigh ?? 180;

      updateTrayNumber(glucoseValue, targetLow, targetHigh);
    } else {
      console.log('No glucose data available for tray update');
    }
  }

  const populateGraphData = async () => {
    try {
      const data = await getCGMData({
        token: token ?? '',
        country: country ?? '',
        accountId: accountId ?? '',
      });

      if (data === null) {
        setTimeout(() => {
          toast.error('Unable to fetch glucose data. Please try again.');
        }, 100);
        setGraphData({}); // Set empty data to show dashboard with NaN
        setIsReady(true);
        return;
      }

      if (data && typeof data === 'object' && 'error' in data) {
        // Add a small delay to ensure toast is displayed after i18n changes
        setTimeout(() => {
          if (data.error === 'NO_CONNECTIONS') {
            toast.error(data.message || 'No LibreLinkUp connections found. Please set up a connection in your Libre app.');
          } else {
            toast.error('Unable to fetch glucose data. Please try again.');
          }
        }, 100);
        setGraphData({}); // Set empty data to show dashboard with NaN
        setIsReady(true);
        return;
      }

      setGraphData(data);
      setIsReady(true);
    } catch (error) {
      console.log('Unable to getCGMData: ', error);
      setTimeout(() => {
        toast.error('Failed to load glucose data. Please check your connection.');
      }, 100);
      setGraphData({}); // Set empty data to show dashboard with NaN
      setIsReady(true);
    }
  };

  const getColor = (
    value: number,
    targetLow: number,
    targetHigh: number,
  ): string => {
    if (value < LOW) {
      return 'bg-red-500';
    }

    if (value > HIGH) {
      return 'bg-orange-500';
    }

    if (
      (value < targetLow && value >= LOW) ||
      (value > targetHigh && value <= HIGH)
    ) {
      return 'bg-yellow-500';
    }

    return 'bg-green-500';
  };

  useEffect(() => {
    populateGraphData();

    const interval = setInterval(() => {
      populateGraphData();
    }, 1000 * 60);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    updateTrayManually();
  }, [graphData]);

  useEffect(() => {
    const initializeTray = () => {
      const visibility = getTrayVisibility();

      if (visibility) {
        setTrayVisibility(true);
      } else {
        setTrayVisibility(false);
      }

      updateTrayManually();
    };

    initializeTray();
  }, []);

  const openSettings = (path: string) => {
    setRedirectTo(path);
    openNewWindow(path, 1024, 768);
  };

  // 👉 overlay mode functions
  const [currentWindowMode, setCurrentWindowMode] = useState<null | string>(
    null,
  );
  useEffect(() => {
    const fetchWindowMode = async () => {
      const mode = await getLocalStorageWindowMode();
      setCurrentWindowMode(mode);

      if (mode === 'overlayTransparent') {
        document.body.style.background = 'transparent';
      } else {
        document.body.style.background = '';
      }
    };
    fetchWindowMode();
  }, []);

  const changeToWindowedMode = () => {
    setWindowMode('windowed');
  }

  // 👉 glucose alerts

  const { dispatchAlert } = useGlucoseAlerts();

  useEffect(() => {
    if (graphData?.glucoseMeasurement?.ValueInMgPerDl !== undefined &&
        graphData?.glucoseMeasurement?.ValueInMgPerDl !== null) {
      dispatchAlert(graphData.glucoseMeasurement.ValueInMgPerDl,graphData?.targetLow,graphData?.targetHigh);
    }
  }, [graphData])

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <BaseLayout
      className={`${
        currentWindowMode === 'overlayTransparent'
          ? 'transparent'
          : getColor(
              graphData?.glucoseMeasurement?.ValueInMgPerDl ?? 1,
              graphData?.targetLow ?? 1,
              graphData?.targetHigh ?? 1,
            )
      } flex justify-center items-center draggable`}
    >
      {currentWindowMode == 'windowed' ? (
        <button
          onClick={() => openSettings('/settings/general')}
          className="absolute 2xs:top-5 2xs:right-5 right-0 top-0 outline-none hover:bg-white/20 p-2 rounded-md transition-all no-draggable"
        >
          <GearIcon className="text-white 2xs:h-6 2xs:w-6 w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => changeToWindowedMode()}
          className="absolute 2xs:top-2 2xs:right-2 md:top-5 md:right-5 right-0 top-0 outline-none hover:bg-white/20 p-2 rounded-md transition-all no-draggable"
        >
          <div className=''>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white 2xs:h-6 2xs:w-6 w-4 h-4">
            <defs>
              <filter id="pathShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="2" dy="1" stdDeviation="2" flood-color="rgba(0, 0, 0, 0.9)"></feDropShadow>
              </filter>
            </defs>

            <path d="M2 2.5C2 2.22386 2.22386 2 2.5 2H5.5C5.77614 2 6 2.22386 6 2.5C6 2.77614 5.77614 3 5.5 3H3V5.5C3 5.77614 2.77614 6 2.5 6C2.22386 6 2 5.77614 2 5.5V2.5ZM9 2.5C9 2.22386 9.22386 2 9.5 2H12.5C12.7761 2 13 2.22386 13 2.5V5.5C13 5.77614 12.7761 6 12.5 6C12.2239 6 12 5.77614 12 5.5V3H9.5C9.22386 3 9 2.77614 9 2.5ZM2.5 9C2.77614 9 3 9.22386 3 9.5V12H5.5C5.77614 12 6 12.2239 6 12.5C6 12.7761 5.77614 13 5.5 13H2.5C2.22386 13 2 12.7761 2 12.5V9.5C2 9.22386 2.22386 9 2.5 9ZM12.5 9C12.7761 9 13 9.22386 13 9.5V12.5C13 12.7761 12.7761 13 12.5 13H9.5C9.22386 13 9 12.7761 9 12.5C9 12.2239 9.22386 12 9.5 12H12V9.5C12 9.22386 12.2239 9 12.5 9Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" filter="url(#pathShadow)"></path>
          </svg>
          </div>
        </button>
      )}
      <div className="flex items-center gap-3">
        <p
            className={`${
              currentWindowMode === 'overlayTransparent'
                ? 'overlay-shadow'
                : ''
            } text-white font-semibold xs:text-3xl text-xl`}
        >
          {getUserValue(graphData?.glucoseMeasurement?.ValueInMgPerDl) +
            ' ' +
            getUserUnit()}
        </p>
        <div
          className={`flex justify-center items-center xs:h-12 xs:w-12 h-6 w-6 rounded-full ${
            currentWindowMode === 'overlayTransparent'
              ? getColor(
                  graphData?.glucoseMeasurement?.ValueInMgPerDl ?? 1,
                  graphData?.targetLow ?? 1,
                  graphData?.targetHigh ?? 1,
                )
              : 'bg-white/25'
          }`}
        >
          <TrendArrow
            className="h-9 w-9 text-white"
            trend={graphData?.glucoseMeasurement?.TrendArrow ?? 1}
          />
        </div>
      </div>
    </BaseLayout>
  );
}
