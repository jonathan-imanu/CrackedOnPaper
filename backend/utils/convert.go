package utils

import (
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

func ConvertStringToUUID(s string) (pgtype.UUID, error) {
	var uuid pgtype.UUID
	if err := uuid.Scan(s); err != nil {
		return pgtype.UUID{}, err
	}
	return uuid, nil
}

func ConvertPgUUIDToUUID(pgUUID pgtype.UUID) uuid.UUID {
	if !pgUUID.Valid {
		return uuid.Nil
	}
	return uuid.UUID(pgUUID.Bytes)
}

func ConvertPgTextToString(pgText pgtype.Text) string {
	if !pgText.Valid {
		return ""
	}
	return pgText.String
}

func ConvertToUUID(val interface{}) (pgtype.UUID, bool) {
	if val == nil {
		return pgtype.UUID{}, false
	}

	switch v := val.(type) {
	case pgtype.UUID:
		return v, v.Valid
	case string:
		uuid := pgtype.UUID{}
		err := uuid.Scan(v)
		return uuid, err == nil && uuid.Valid
	case [16]uint8:
		// Convert byte array directly to pgtype.UUID
		uuid := pgtype.UUID{
			Bytes: v,
			Valid: true,
		}
		return uuid, true
	case []uint8:
		if len(v) == 16 {
			// Convert byte slice to array and then to pgtype.UUID
			var byteArray [16]uint8
			copy(byteArray[:], v)
			uuid := pgtype.UUID{
				Bytes: byteArray,
				Valid: true,
			}
			return uuid, true
		}
		return pgtype.UUID{}, false
	default:
		fmt.Printf("DEBUG: Unexpected UUID type: %T, value: %v\n", v, v)
		return pgtype.UUID{}, false
	}
}

func ConvertToInt32(val interface{}) (int32, bool) {
	if val == nil {
		return 0, false
	}

	switch v := val.(type) {
	case int32:
		return v, true
	case int:
		return int32(v), true
	case int64:
		return int32(v), true
	case pgtype.Int4:
		return v.Int32, v.Valid
	default:
		return 0, false
	}
}