import React, { useCallback, useEffect, useState } from 'react';
import apiService from '../app/apiService';
import { DataGrid } from '@mui/x-data-grid';
import { Container, Fab, IconButton, Pagination, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ConfirmModal from '../components/ConfirmModal';
import FormModal from '../components/FormModal';
import AddIcon from '@mui/icons-material/Add';

const HomePage = () => {
   const [cars, setCars] = useState([]);
   const [count, setCount] = useState(1);
   const [page, setPage] = useState(1);
   const [openForm, setOpenForm] = useState(false);
   const [openConfirm, setOpenConfirm] = useState(false);
   const [selectedCar, setSelectedCar] = useState(null);
   const [mode, setMode] = useState('create');

   const handleClickNew = () => {
      setMode('create');
      setOpenForm(true);
   };
   const handleClickEdit = (id) => {
      setMode('edit');
      setSelectedCar(cars.find((car) => car._id === id));
      setOpenForm(true);
   };

   const handleClickDelete = (id) => {
      setOpenConfirm(true);
      setSelectedCar(cars.find((car) => car._id === id));
   };
   const handleDelete = async () => {
      try {
         await apiService.delete(`/car/${selectedCar._id}`);
         getData();
      } catch (err) {
         console.log(err);
      }
   };
   const name =
      selectedCar?.Year + ' ' + selectedCar?.Make + ' ' + selectedCar?.Model;
   const columns = [
      { field: 'name', headerName: 'Name', flex: 2, minWidth: 120 },
      { field: 'make', headerName: 'Make', flex: 1, minWidth: 120 },
      { field: 'style', headerName: 'Style', flex: 1, minWidth: 120 },
      { field: 'size', headerName: 'Size', flex: 1, minWidth: 100 },
      {
         field: 'transmission_type',
         headerName: 'Transmission Type',
         flex: 1.5,
         minWidth: 120,
      },
      { field: 'price', headerName: 'Price', flex: 1, minWidth: 80 },
      { field: 'release_date', headerName: 'Year', flex: 1, minWidth: 80 },
      {
         field: 'id',
         headerName: 'Edit/Delete',
         minWidth: 120,
         flex: 1,
         sortable: false,
         renderCell: ({ value }) => (
            <Stack direction='row' spacing={1}>
               <IconButton onClick={() => handleClickEdit(value)}>
                  <EditIcon />
               </IconButton>
               <IconButton onClick={() => handleClickDelete(value)}>
                  <DeleteIcon />
               </IconButton>
            </Stack>
         ),
      },
   ];
   const rows = cars.map((car) => ({
      id: car._id,
      name: car.Model,
      make: car.Make,
      size: car.Size,
      style: car.Vehicles,
      transmission_type: car['Transmission Type'],
      price: `${car.Price.price} ${car.Price.currency}`,
      release_date: car.Year,
   }));

   const getData = useCallback(async () => {
      const res = await apiService.get(`/car?page=${page}`);
      setCars(res.result.cars);
      setCount(res.result.count);
   }, [page]);

   useEffect(() => {
      getData();
   }, [getData]);

   return (
      <Container maxWidth='lg' sx={{ pb: 3 }}>
         <ConfirmModal
            open={openConfirm}
            name={name}
            handleClose={() => {
               setOpenConfirm(false);
            }}
            action={handleDelete}
         />
         <FormModal
            open={openForm}
            refreshData={() => {
               setOpenForm(false);
               setSelectedCar(null);
               getData();
            }}
            selectedCar={selectedCar}
            handleClose={() => {
               setOpenForm(false);
               setSelectedCar(null);
            }}
            mode={mode}
         />
         <div style={{ height: 630, width: '100%' }}>
            <DataGrid
               disableSelectionOnClick
               rows={rows}
               rowCount={5 * count}
               columns={columns}
               rowsPerPageOptions={[]}
               components={{
                  Pagination: () => (
                     <Pagination
                        color='primary'
                        count={Math.ceil(count / 10)}
                        page={page}
                        onChange={(e, val) => setPage(val)}
                     />
                  ),
               }}
            />
         </div>
         <Fab
            variant='extended'
            color='info'
            onClick={handleClickNew}
            sx={{ position: 'fixed', bottom: 10, left: 10 }}
            aria-label='add'
         >
            <AddIcon />
            New
         </Fab>
      </Container>
   );
};
export default HomePage;
