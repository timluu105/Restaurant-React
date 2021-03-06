import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import request from '../../../utils/apiRequest';
import { enqueueSnackbar } from '../../../shared/Notifier/redux/actions';

export default () => {
  const { id: restaurantId } = useParams();
  const dispatch = useDispatch();
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [filters, setFilters] = useState({});
  const [sorts, setSorts] = useState(['date -1']);
  const [isLoading, setIsLoading] = useState(false);
  const [restaurant, setRestaurant] = useState({});
  const [reportData, setReportData] = useState({});

  const readRestaurant = async () => {
    setIsLoading(true);
    try {
      const data = await request(
        `/restaurants/${restaurantId}`,
        'GET',
        null,
        true
      );
      setRestaurant(data);
    } catch (err) {
      dispatch(enqueueSnackbar(err.message, 'error'));
    }
    setIsLoading(false);
  };

  const getReport = async () => {
    setIsLoading(true);
    try {
      const data = await request(
        `/restaurants/${restaurantId}/report`,
        'GET',
        null,
        true
      );
      setReportData(data);
    } catch (err) {
      dispatch(enqueueSnackbar(err.message, 'error'));
    }
    setIsLoading(false);
  };

  const listReviews = async (
    page = pageNum,
    limit = perPage,
    newFilters = filters,
    newSorts = sorts
  ) => {
    const filtersData = {};
    Object.assign(
      filtersData,
      newFilters.comment && {
        comment: { $regex: filters.comment, $options: 'i' },
      },
      newFilters.reply && { reply: { $regex: filters.reply, $options: 'i' } }
    );

    const requestData = {
      skip: page * limit,
      limit,
      filters: filtersData,
      sorts: newSorts,
    };

    setIsLoading(true);
    try {
      const { data, total } = await request(
        `/restaurants/${restaurantId}/reviews`,
        'GET',
        requestData,
        true
      );
      setList(data);
      setTotal(total);
    } catch (err) {
      dispatch(enqueueSnackbar(err.message, 'error'));
    }
    setIsLoading(false);
  };

  const addNewReview = (newData) => {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await request(
          `/restaurants/${restaurantId}/reviews`,
          'POST',
          newData,
          true
        );
        await listReviews();
        readRestaurant(restaurantId);
        resolve(result);
      } catch (err) {
        dispatch(enqueueSnackbar(err.message, 'error'));
        reject();
      }
    });
  };

  const updateReview = (newData, oldData) => {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await request(
          `/restaurants/${restaurantId}/reviews/${oldData._id}`,
          'PUT',
          { ...oldData, ...newData },
          true
        );
        readRestaurant(restaurantId);
        setList(list.map((el) => (el._id === result._id ? result : el)));
        resolve(result);
      } catch (err) {
        dispatch(enqueueSnackbar(err.message, 'error'));
        reject();
      }
    });
  };

  const deleteReview = (oldData) => {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await request(
          `/restaurants/${restaurantId}/reviews/${oldData._id}`,
          'DELETE',
          null,
          true
        );

        await listReviews();
        readRestaurant(restaurantId);
        resolve(result);
      } catch (err) {
        dispatch(enqueueSnackbar(err.message, 'error'));
        reject();
      }
    });
  };

  const replyToComment = async (reviewId, reply) => {
    try {
      await request(
        `/restaurants/${restaurantId}/reviews/${reviewId}`,
        'PUT',
        { reply },
        true
      );
      setList(
        list.map((review) =>
          review._id === reviewId ? { ...review, reply } : review
        )
      );
    } catch (err) {
      dispatch(enqueueSnackbar(err.message, 'error'));
    }
  };

  useEffect(() => {
    listReviews(pageNum, perPage, filters, sorts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perPage, pageNum, filters, sorts]);

  useEffect(() => {
    readRestaurant(restaurantId);
    getReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  useEffect(() => {
    getReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  return {
    listReviews,
    addNewReview,
    updateReview,
    deleteReview,
    replyToComment,
    list,
    total,
    isLoading,

    perPage,
    setPerPage,

    pageNum,
    setPageNum,

    filters,
    setFilters,

    setSorts,

    restaurant,
    reportData,
  };
};
