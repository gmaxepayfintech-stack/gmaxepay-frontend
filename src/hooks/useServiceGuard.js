import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllServices } from '@/redux/action/userAction';
import { useNavigate } from 'react-router-dom';
import { useLayoutPath } from '@/util';

export const useServiceGuard = serviceName => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const layout = useLayoutPath();

  const user = useSelector(state => state.auth?.user);
  const servicesData = useSelector(state => state.user?.services);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAllServices(user.id));
    }
  }, [dispatch, user?.id]);
  useEffect(() => {
    if (Array.isArray(servicesData)) {
      const isServiceEnabled = servicesData.some(
        service => service.serviceName === serviceName
      );
      if (!isServiceEnabled) {
        navigate(`${layout}/home`);
      }
    }
  }, [servicesData, navigate, layout, serviceName]);
};
