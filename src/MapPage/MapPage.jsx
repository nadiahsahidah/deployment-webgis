import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, LayersControl, ZoomControl, WMSTileLayer, Marker, Popup} from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar'
import Footer from '../components/Footer';
import CommentPopup from '../components/CommentPopup';
import './MapPage.css'

// set marker history
const markerIcon = new L.Icon({
  iconUrl: require("../assets/markerMerah.webp"),
  iconSize: [25, 40],
  iconAnchor: [17, 46],
  popupAnchor: [0, -46],
})

//set marker location search 
const markerIcon2 = new L.Icon({
  iconUrl: require("../assets/markerHijau.png"),
  iconSize: [55, 60],
  iconAnchor: [17, 46],
  popupAnchor: [0, -46],
})


const MapPage = () => {
  const coordinates = [-6.596980, 106.795600];
  const [markerData, setMarkerData] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const mapRef = useRef(null);
  
  useEffect(() => {
    const fetchMarkerData = async () => {
        try {
            // Fetch data jaringan jalan dan titik kerusakan jalan
            const [responseJalanJabar, responseJalanNasional, responseJalanRusak] = await Promise.all([
                axios.get('http://localhost:8080/geoserver/ne/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ne:Jalan_Provinsi_Jabar&outputFormat=application/json&srsName=EPSG:4326'),
                axios.get('http://localhost:8080/geoserver/ne/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ne:jalan-nasional&outputFormat=application/json&srsName=EPSG:4326'),
                axios.get('http://localhost:8080/geoserver/ta/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ta:final_combined&outputFormat=application/json&srsName=EPSG:4326'),
              ]);

            // Respon data history
            setMarkerData(responseJalanRusak.data);

            //custom style ruas jaringan jalan
            const myStyleProv = {
              color: "#ff0000"
            }
            const myStyleNas = {
              color: "#ffff00"
            }
            
            if (mapRef.current) {
                L.geoJSON(responseJalanJabar.data, {
                    onEachFeature: function (feature, layer) {
                        layer.on('click', function (e) {
                            const properties = feature.properties;
                            const popupContent = `
                                <div>
                                  <p style= 'color: black; padding: 5px; margin: 0;' >Ruas : ${properties.RUAS}</p>
                                  <p style= 'color: black; padding: 5px; margin: 0;' >Fungsi : ${properties.FUNGSI}</p>
                                  <p style= 'color: black; padding: 5px; margin: 0;' >Latitude : ${properties.Y_COORD}</p>
                                  <p style= 'color: black; padding: 5px; margin: 0;' >Longitude : ${properties.X_COORD}</p>
                                </div>
                            `;
                            layer.bindPopup(popupContent).openPopup();
                        });
                    },
                    style: myStyleProv
                }).addTo(mapRef.current);

                L.geoJSON(responseJalanNasional.data, {
                    onEachFeature: function (feature, layer) {
                        layer.on('click', function (e) {
                            const properties = feature.properties;
                            const popupContent = `
                                <div>
                                  <p style= 'color: black; padding: 5px; margin: 0;' >Ruas : ${properties.NAMA_SK}</p>
                                  <p style= 'color: black; padding: 5px; margin: 0;' >Lintas : ${properties.LINTAS}</p>
                                  <p style= 'color: black; padding: 5px; margin: 0;' >Kelas Jalan : ${properties.KLS_JALAN}</p>
                                  <p style= 'color: black; padding: 5px; margin: 0;' >Latitude : ${properties.Y_LABEL}</p>
                                  <p style= 'color: black; padding: 5px; margin: 0;' >Longitude : ${properties.X_LABEL}</p>
                                </div>
                            `;
                            layer.bindPopup(popupContent).openPopup();
                        });
                    },
                    style: myStyleNas
                  }).addTo(mapRef.current);
            }

        } catch (error) {
            console.error('Error fetching data from GeoServer:', error);
        }
    };

    fetchMarkerData();
}, []); 

  // GET comment ketika marker di klik dan muncul popup
  const handleMarkerClick = async (id) => {
    try {
      const response = await axios.get(`http://103.178.153.251:3333/locations/${id}/comments`)
      console.log(response.data.data)
      setShowComment(response.data.data)
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [showComment, setShowComment] =useState([]);

  // Fungsi untuk menangani perubahan pada input pencarian
  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  // Fungsi untuk menangani pemilihan lokasi dari hasil pencarian
  const handleSelect = async (value) => {
    setSearchQuery(value);

    try {
      const results = await geocodeByAddress(value);
      const latLng = await getLatLng(results[0]);
      // Set koordinat peta ke lokasi yang dipilih
      mapRef.current.setView(latLng, 13);
      setSearchResults({ latLng, address: value });
    } catch (error) {
      console.error('Error selecting place:', error);
    }
  };

  // Legenda Peta
  function LegendControl() {
    return (
      <div className="legend-control">
        <h4 style={{ fontSize: 15 }}>Legenda</h4>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: 'yellow' }}></span>
          <span className="legend-text">Jalan Provinsi</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: 'red' }}></span>
          <span className="legend-text">Jalan Nasional</span>
        </div>
      </div>
    );
  }

  // Untuk menangani role yang akan melapor
  useEffect(()=> {
    const token = localStorage.getItem('userToken');
    const role = localStorage.getItem('userRole');

    if (token) {
      setIsLoggedIn(true); 
      setUserRole(role);
      return;
    }
  },[])

  // Alart fitur Laporkan!
  const showLoginAlert = () => {
    Swal.fire({
      icon: 'error',
      title: 'Akses Terbatas: Mohon Login',
      text: 'Maaf, akses ke fitur ini terbatas hanya untuk pengguna yang sudah login.',
    });
  };

  const handleLaporClick = () => {
    if (!isLoggedIn) {
      showLoginAlert();
    } else {
      if (userRole === 'admin') {
        navigate('/form');
      } else if (userRole === 'user') {
        navigate('/formUser');
      } else {
        showLoginAlert();
      }
    }
  };

  return (
    <>
      <div>
        <Navbar />
      </div>
      {/* Search Box */}
      <div className="search-box">
      <PlacesAutocomplete
          value={searchQuery}
          onChange={handleSearchChange}
          onSelect={handleSelect}
        >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div>
            <input
              {...getInputProps({
                placeholder: 'Cari lokasi...',
                className: 'location-search-input',
              })}
            />
            <div className="autocomplete-dropdown-container">
              {loading && <div>Loading...</div>}
              {suggestions.map((suggestion, index) => {
                const className = suggestion.active
                  ? 'suggestion-item--active'
                  : 'suggestion-item';
                const style = suggestion.active
                  ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                  : { backgroundColor: '#ffffff', cursor: 'pointer' };
                return (
                  <div
                    key={index} 
                    {...getSuggestionItemProps(suggestion, {
                      className,
                      style,
                    })}
                  >
                    <span>{suggestion.description}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PlacesAutocomplete>
      </div>
      <div >
        <MapContainer ref={mapRef} center={coordinates} zoom={8} scrollWheelZoom={false} style={{ height: 'calc(100vh - 80px)', marginTop: '84px' }} className='map-container' zoomControl={false} >
          <ZoomControl className="zoom" />
          <LayersControl position="topright" className='custom-layers-control' style={{ color: 'white', padding:0}}>
            <LayersControl.BaseLayer name="OpenStreetMaps" checked>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Google Streets">
              <TileLayer
                attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a> contributors'
                url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Google Satellite">
              <TileLayer
                attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a> contributors'
                url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              />  
            </LayersControl.BaseLayer>
            <LayersControl.Overlay name="Jalan Provinsi" checked>
              <WMSTileLayer
                layers="ne:Jalan_Provinsi_Jabar"
                url="http://localhost:8080/geoserver/wms?"
                format="image/png"
                transparent={true}
              />
            </LayersControl.Overlay>
            <LayersControl.Overlay name="Jalan Nasional" checked>
              <WMSTileLayer
                layers="ne:jalan-nasional"
                url="http://localhost:8080/geoserver/wms?"
                format="image/png"
                transparent={true}
              />
            </LayersControl.Overlay>
            <LayersControl.Overlay name="Titik Kerusakan Jalan" checked>
              <WMSTileLayer
                layers="ta:final_combined"
                url="http://localhost:8080/geoserver/wms?"
                format="image/png"
                transparent={true}
              />
            </LayersControl.Overlay>
          
          </LayersControl>
          <LegendControl/>
          {markerData && markerData.features && markerData.features.map((feature, index) => {
            // console.log(feature.properties.location_id)
            return (
            <Marker key={index} position={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]} icon={markerIcon} 
            eventHandlers={{ click: () => handleMarkerClick(feature.properties.location_id) }} 
            >
              <Popup>
                <div className='wrapper'>
                  <div className="container">
                    <p style={{color: 'black', padding: 0, marginTop: 8, marginBottom: 8 }}>Provinsi : {feature.properties.provinsi}</p>
                    <p style={{color: 'black', padding: 0, marginTop: 8, marginBottom: 8 }}>Kabupaten/Kota : {feature.properties.kabupaten_kota}</p>
                    <p style={{color: 'black', padding: 0, marginTop: 8, marginBottom: 8 }}>Kecamatan : {feature.properties.kecamatan}</p>
                    <p style={{color: 'black', padding: 0, marginTop: 8, marginBottom: 8 }}>Desa : {feature.properties.desa}</p>
                    <p style={{color: 'black', padding: 0, marginTop: 8, marginBottom: 8 }}>Latitude : {feature.properties.latitude}</p>
                    <p style={{color: 'black', padding: 0, marginTop: 8, marginBottom: 8 }}>Longitude : {feature.properties.longitude}</p>
                    <p style={{color: 'black', padding: 0, marginTop: 8, marginBottom: 8 }}>Macam Kerusakan : {feature.properties.macam_kerusakan}</p>
                    <p style={{color: 'black', padding: 0, marginTop: 8, marginBottom: 8 }}>Panjang Kerusakan : {feature.properties.panjang_kerusakan} (m)</p>
                    <p style={{color: 'black', padding: 0, marginTop: 8, marginBottom: 8 }}>Tanggal Penanganan : {new Date(feature.properties.penanganan_date).toLocaleDateString()}</p>
                    <p style={{color: 'black', padding: 0, marginTop: 8, marginBottom: 8 }}>Komentar :
                    {showComment && showComment.map((comment) => {
                      return (
                        <p style={{color: 'black', padding: 0 }}> "{comment.content}"</p>
                      )
                    })}
                    </p>
                  </div>
                  <div className="imgContainer">
                    <img src={`http://103.178.153.251:3333/${feature.properties.photo_photo}`} alt={feature.properties.photo_name} style={{ width: '100%'}}/>
                    <video controls autoPlay style={{ width: '100%', marginTop: "10px"  }} >
                      <source src={`http://103.178.153.251:3333/${feature.properties.video_video}`} type="video/mp4" />
                    </video> 
                  </div>
                  <CommentPopup locationId={feature.properties.location_id} />
                </div>
              </Popup>
            </Marker>
            )
          } )
        }
        
        {searchResults && (
          <Marker position={[searchResults.latLng.lat, searchResults.latLng.lng]} icon={markerIcon2}>
            <Popup>
              <div>
                <p style={{color: 'black', padding: 0 }}>{searchResults.address}</p>
                <p style={{color: 'black', padding: 0 }}>{searchResults.latLng.lat}, {searchResults.latLng.lng}</p>
              </div>
            </Popup>
          </Marker>
        )}
        </MapContainer>


        <div className='Pelaporan' align='center'>
          <button onClick={handleLaporClick} className='button' id='lapor-button'>Laporkan!
          </button>
        </div>
      </div >

      <Footer />

    </>
  );
}

export default MapPage;

