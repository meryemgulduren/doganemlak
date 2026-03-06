1. listings (İlanlar)
_id: ObjectId

listing_no: Long (Örn: 1297921630)

title: String

description: String (HTML/Text)

price: Double

currency: String (TRY, USD, EUR)

listing_date: Date

listing_type: Enum (SATILIK, KIRALIK)

property_type: Enum (DAIRE, VILLA, ARSA, IS_YERI, BINA)

m2_brut: Integer

m2_net: Integer

room_count: String (2+1, 3+1, vb.)

floor_number: Integer

total_floors: Integer

building_age: String (0, 1-5, 11-15, vb.)

heating_type: String (Kombi, Merkezi, vb.)

bathroom_count: Integer

balcony: Boolean

furnished: Boolean

using_status: String (Mülk Sahibi, Kiracı, Boş)

in_site: Boolean

credit_eligible: Boolean

dues: Double (Aidat)

facade: Array<String> (Batı, Doğu, Güney, Kuzey)

location: {

city: String

district: String

neighborhood: String

coordinates: { lat: Double, lng: Double }
}

media: {

images: Array<String>

videos: Array<String>
}

features: Array<ObjectId> (Referance: feature_definitions)

view_count: Long

favorite_count: Long

status: Enum (ACTIVE, PASSIVE, SOLD)

admin_id: ObjectId

created_at: Date

updated_at: Date

2. feature_definitions (Dinamik Özellik Tanımları)
_id: ObjectId

category: Enum (IC_OZELLIKLER, DIS_OZELLIKLER, MUHIT, ULASIM, MANZARA, KONUT_TIPI, ENGELLI_UYGUNLUK)

key: String (Unique ID: "ADSL", "CELIK_KAPI", "HAVUZ")

label: String (Görünen isim: "Çelik Kapı", "Fiber İnternet")

is_active: Boolean

3. users (Kullanıcılar & Adminler)
_id: ObjectId

username: String (Unique)

email: String (Unique)

password_hash: String

phone: String

role: Enum (ADMIN, USER)

profile_image: String

favorites: Array<ObjectId> (Referance: listings)

last_login: Date

created_at: Date

4. reviews (Yorumlar)
_id: ObjectId

listing_id: ObjectId

user_id: ObjectId

comment_text: String

rating: Integer (1-5)

is_approved: Boolean

created_at: Date

5. messages (Mesajlar & Bildirimler)
_id: ObjectId

sender_id: ObjectId

receiver_id: ObjectId

listing_id: ObjectId (Opsiyonel)

subject: String

message_body: String

is_read: Boolean

type: Enum (MESSAGE, INQUIRY, NOTIFICATION)

created_at: Date

6. site_settings (Genel Site Ayarları)
_id: ObjectId

logo_url: String

contact_email: String

social_media: {

facebook: String

instagram: String

linkedin: String
}

terms_and_conditions: String (KVKK metni vb.)

7. site_analytics (Admin İstatistikleri)
_id: ObjectId

date: Date (Günlük bazda)

total_users: Long

total_listings: Long

active_visitor_count: Long

most_searched_keywords: Array<String>