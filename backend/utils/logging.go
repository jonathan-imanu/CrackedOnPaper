package utils

import (
	"sync"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var (
	defaultLogger *zap.Logger
	once          sync.Once
	initErr       error
)

func Logger() *zap.Logger {
	once.Do(func() {
		cfg := zap.Config{
			Level:       zap.NewAtomicLevelAt(zap.InfoLevel),
			Development: false,
			Encoding:    "json",
			Sampling: &zap.SamplingConfig{Initial: 100, Thereafter: 100},
			EncoderConfig: zapcore.EncoderConfig{
				TimeKey:       "ts",
				LevelKey:      "level",
				NameKey:       "logger",
				CallerKey:     "caller",
				MessageKey:    "msg",
				StacktraceKey: "stack",
				LineEnding:    zapcore.DefaultLineEnding,
				EncodeLevel:   zapcore.LowercaseLevelEncoder,
				EncodeTime:    zapcore.TimeEncoderOfLayout(time.RFC3339Nano),
				EncodeDuration: zapcore.SecondsDurationEncoder,
				EncodeCaller:  zapcore.ShortCallerEncoder,
			},
			OutputPaths:      []string{"stdout"},
			ErrorOutputPaths: []string{"stderr"},
		}
		var l *zap.Logger
		l, initErr = cfg.Build(zap.AddCaller(), zap.AddCallerSkip(1))
		if initErr == nil {
			defaultLogger = l
		}
	})
	if initErr != nil {
		panic("logger init failed: " + initErr.Error())
	}
	return defaultLogger
}